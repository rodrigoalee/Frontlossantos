# Diseño: registro e inicio de sesión con Google

Fecha: 2026-10-23
Repos involucrados: `Frontlossantos` (Next.js, portal) y `CustomCore.API` (.NET 8)

## Intención y por qué

El portal de clientes de CustomCore ya permite registrarse con correo y contraseña. Queremos que un cliente que quiere agendar una cita en el taller pueda entrar con su cuenta de Google en lugar de inventar otra contraseña.

El flujo de OAuth ya está implementado en el front: `src/app/auth/google/route.ts` arma la URL de consentimiento con Authorization Code + PKCE, y `src/app/auth/google/callback/route.ts` intercambia el código por el `id_token` y lo manda a `POST /api/auth/google`.

**Ese endpoint no existe en `AuthController`.** Hoy ese llamado falla con 404 y el login con Google no funciona. Lo que falta es el endpoint que recibe el `id_token`, las decisiones de modelo de datos que eso arrastra, y el piso en el front para sostener una sesión autenticada.

## Objetivos

- Un cliente puede crear cuenta e iniciar sesión con Google, sin contraseña.
- Un cliente que ya creó su cuenta con correo y contraseña puede entrar con Google, y queda vinculada a la misma cuenta.
- Después de crear cuenta con Google, el cliente entrega su teléfono antes de poder usar el portal.
- La sesión resultante es idéntica a la del login normal: el JWT de la API en una cookie httpOnly.
- El front manda ese JWT en sus llamadas a la API, y `/panel` deja de estar abierto a visitantes sin sesión.

## No objetivos

- Agendar la cita. Requiere un vehículo (`Cita.VehiculoId` es obligatorio) y es otro flujo.
- Registrar vehículos.
- Autenticación con Google para empleados del taller.
- Otros proveedores de identidad (Facebook, Apple).
- Recuperación de contraseña, y el flujo de "agregar contraseña a mi cuenta de Google".
- Un "cerrar sesión en todos mis dispositivos", ni self service ni administrativo. Ver decisión 7.
- Arreglar el reparto del límite de intentos de `/api/auth/registro`. Es un bug real y preexistente, pero ajeno a este cambio. Ver notas al final.

## Anti objetivos

Esto fracasa, aunque técnicamente funcione, si:

- Alguien se apropia del historial de servicios de un cliente del taller con solo saber su correo.
- Un empleado obtiene acceso de empleado entrando por Google.
- La API acepta un `id_token` emitido para otra aplicación.
- Un cliente que entra por Google termina con una ficha duplicada en el taller.
- Se le exige una contraseña a alguien que entró con Google.
- Una persona queda encerrada detrás del formulario de completar perfil sin salida.

## Restricciones

- `Cliente.Telefono` es obligatorio en la entidad, y el registro público lo exige en formato E.164 porque se usa para WhatsApp.
- `Usuario.Correo` y `Cliente.Correo` se normalizan a minúsculas, son únicos, y funcionan como identidad.
- El claim `cred_ver` del JWT se valida en cada petición, en `OnTokenValidated` dentro de `ConfiguracionSeguridad`, que además exige `Activo`.
- Npgsql exige envolver las transacciones explícitas en `db.Database.CreateExecutionStrategy()`.
- El front está desplegado en Vercel; `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` ya están configurados ahí, y el cliente de OAuth ya existe en Google Cloud.
- Convención del repo de la API: comentarios `//[INICIO][fecha][autor][razón]` y `//[FIN][...]` delimitando cada cambio.
- El scope solicitado a Google es `openid email profile`, así que los datos disponibles son `sub`, `email`, `email_verified`, `name`, `given_name`, `family_name` y `picture`. Google no entrega teléfono.
- `PasswordService.Verificar` devuelve `false` temprano, sin hacer el trabajo de BCrypt, cuando el hash es nulo o no mide 60 caracteres.

## Decisiones tomadas

### 1. Cuentas sin contraseña

`Usuario.PasswordHash` pasa a nullable. A quien entra con Google nunca se le pide una contraseña. Podrá agregar una después desde su cuenta; el modelo lo permite, pero ese flujo no es parte de este cambio.

Invariante: toda cuenta debe tener al menos una credencial, un `PasswordHash` o un `GoogleId`.

**Cuidado con el canal de tiempo.** `AuthService.IniciarSesionAsync` hoy compara contra `usuario?.PasswordHash ?? HashFicticio` para que una cuenta inexistente cueste lo mismo que una existente. Como `Verificar` corta temprano con hash nulo, una cuenta de Google sería medible y notoriamente más rápida que una cuenta inexistente, revelando que ese correo tiene cuenta. Ese `?? HashFicticio` debe quedar tal cual y absorber también el caso nulo: en el login por contraseña, una cuenta de Google se comporta exactamente como una cuenta que no existe, mismo 401 y mismo costo.

### 2. `GoogleId` en `Usuario`

Columna nueva, nullable y única, que guarda el `sub` del `id_token`. Es la llave de búsqueda en logins posteriores, no el correo: el correo de una cuenta de Google puede cambiar, el `sub` no.

### 3. `VersionCredenciales` reemplaza al hash como fuente de `cred_ver`

Columna nueva y no nula en `Usuario`, con un valor aleatorio. `JwtService.CrearVersionCredenciales` y `CoincideVersionCredenciales` reciben ese valor en lugar del `PasswordHash`. Se regenera en `CambiarPasswordAsync`, de modo que cambiar la contraseña sigue matando todas las sesiones anteriores. La migración asigna un valor a las cuentas existentes.

Por qué: el mecanismo que invalida sesiones viejas no puede depender de que exista una contraseña, porque las cuentas de Google no tienen. Es el patrón `SecurityStamp` de ASP.NET Core Identity.

Efecto secundario conocido y aceptado: al desplegar la migración, los tokens ya emitidos dejan de coincidir y todas las sesiones activas se cierran. Es un cierre de sesión masivo de una sola vez.

### 4. Validación del `id_token`, incluido el `aud`

La validación usa `GoogleJsonWebSignature.ValidateAsync` del paquete `Google.Apis.Auth`, y **se le pasa explícitamente el client ID en `ValidationSettings.Audience`**. Esto no es opcional ni queda a criterio del implementador: sin el `Audience`, el método valida la firma pero no para quién fue emitido el token, así que la API aceptaría cualquier `id_token` firmado por Google, incluido uno emitido para una aplicación de terceros, y resolvería la cuenta por `sub` o correo. Eso es apropiarse de la cuenta de un cliente sin conocer ninguna contraseña.

La API necesita por tanto su propia copia del client ID, que es el mismo que usa el front. El client ID **no es secreto**: viaja en la URL de consentimiento de OAuth, así que puede ir escrito en `appsettings.json` bajo una sección `Google`, sin el patrón de blanco en archivo más inyección que usan `ConnectionStrings:Default` y `Stripe:ClaveSecreta`. Debe fallar al arrancar si falta, igual que esos. El `client_secret` sigue siendo exclusivo del front, que es quien hace el intercambio del código.

Se exige `email_verified: true`. Si viene falso, se rechaza sin crear ni vincular nada.

### 5. Resolución de la cuenta: solo se vincula lo que la persona misma creó

Orden, una vez validado el `id_token`:

1. Existe `Usuario` con ese `GoogleId` → login.
2. Existe `Usuario` con ese correo, **con rol Cliente y ningún otro rol** → se le escribe el `GoogleId` y entra.
3. Existe `Usuario` con ese correo que **carga algún rol que no sea Cliente** → se rechaza. El mensaje le indica iniciar sesión con su contraseña. El botón de Google es visible para todos, pero la autenticación por Google es solo para clientes.
4. No existe `Usuario`, pero sí una ficha de `Cliente` con ese correo → se rechaza con el mismo conflicto que ya lanza `RegistroService`: "Ese correo ya está registrado en el taller. Comunícate con nosotros para activar tu acceso."
5. No existe nada → se crea la cuenta (decisión 6).

En cualquier caso en que la cuenta encontrada tenga `Activo = false`, **se rechaza antes de escribir nada**, igual que hace el login por contraseña en `AuthService.cs:43`. Sin esto se le escribiría el `GoogleId` a una cuenta inhabilitada y se emitiría un token que luego muere en la primera petición autenticada, porque `OnTokenValidated` exige `Activo`.

La regla 3 es estricta a propósito: un cliente es un cliente y solo carga permisos de cliente. `UsuarioRol` es un many-to-many, así que un empleado que además es cliente del taller podría cargar los dos roles; si la prueba fuera solo "tiene rol Cliente", Google se volvería una puerta de entrada a un token con permisos de empleado.

El caso 4 conserva deliberadamente la regla de `RegistroService.cs:34-41`: quien sepa el correo de un cliente no debe heredar su historial, y esa vinculación la hace el taller verificando identidad. Que Google verifique el correo prueba que la persona controla ese buzón, no que sea el dueño del historial que el taller registró.

El caso 2 es distinto y por eso sí se vincula, pero **quitando la contraseña**. Corrección del 23/10/2026: la versión original suponía que esa cuenta la creó la propia persona, y no es cierto mientras `/api/auth/registro` no verifique el correo. Un atacante puede registrarse con contraseña usando el Gmail de la víctima antes que ella (*account pre-hijacking*); al entrar la víctima con Google se vincularía a esa cuenta y el atacante seguiría entrando con su contraseña. Por eso, al vincular se escribe el `GoogleId`, se pone `PasswordHash = null` y se rota `VersionCredenciales`: el dueño del buzón se queda con la cuenta, la contraseña deja de servir y las sesiones previas mueren. Si la cuenta sí era de la persona, solo pierde su contraseña y sigue entrando con Google. Cuando el registro verifique el correo, se puede volver a conservar la contraseña.

### 6. Perfil incompleto es `rol Cliente` más `ClienteId` nulo

La cuenta creada por Google nace con `ClienteId = null` y con el rol Cliente ya asignado, igual que hace `RegistroService`. No se agrega ninguna bandera de estado nueva.

- El rol responde "esto es una cuenta de cliente", y distingue al cliente del empleado.
- `ClienteId` responde "ya tiene ficha en el taller".

El paso de completar perfil pide el teléfono, crea la ficha de `Cliente` con el nombre y el correo que vinieron del `id_token`, y la vincula al `Usuario`. Antes de ese paso no existe ficha de `Cliente`, porque `Cliente.Telefono` es obligatorio y no hay de dónde sacarlo.

**La salida del callejón.** `Cliente.Correo` es único, así que si el taller crea una ficha con ese mismo correo entre el registro por Google y el completar perfil, la creación choca con el índice único. Como el caso 4 prohíbe vincular esa ficha automáticamente, la persona quedaría redirigida para siempre a un formulario que nunca puede tener éxito. Por eso el endpoint de completar perfil devuelve el mismo conflicto del caso 4, el formulario lo muestra, y **la opción de cerrar sesión es alcanzable desde la pantalla del gate**. Es poco frecuente, pero sin eso es una sesión encerrada sin salida.

### 7. Cerrar sesiones de una cuenta de Google: `Activo = false` es la palanca

No se construye ninguna operación de rotación de `VersionCredenciales` en este cambio. Para una cuenta de Google, la forma de cortar el acceso es `Activo = false` por el endpoint administrativo que ya existe en `UsuariosController`, que inhabilita la cuenta entera y con eso tumba sus sesiones, porque `OnTokenValidated` exige `Activo`.

Es una palanca gruesa y se acepta como tal. La columna `VersionCredenciales` deja la puerta abierta a un "cerrar sesión en todos mis dispositivos" más fino cuando se quiera, sin volver a tocar el modelo.

### 8. El gate es una redirección, no una alerta

Tras el login con Google el usuario queda autenticado, con sesión válida. El layout del portal comprueba el perfil y redirige a `/completar-perfil` mientras esté incompleto. No es un modal que se pueda cerrar: si fuera una alerta, el usuario la descarta y se queda dentro con datos faltantes.

### 9. El front sostiene la sesión

Hoy el piso no está puesto: `src/lib/api.ts` nunca adjunta el JWT a las llamadas, y `src/app/panel/page.tsx` devuelve `null` sin comprobar sesión. Este cambio incluye:

- `apiFetch` manda el JWT de la cookie de sesión en las llamadas que lo necesiten.
- `/panel` queda protegido: sin sesión, a `/login`.
- El layout del portal consulta el estado del perfil en cada navegación y redirige a `/completar-perfil` si está incompleto.

El estado del perfil se lee del servidor, no de un claim del JWT. Así, en cuanto el completar perfil crea la ficha, la siguiente navegación ya ve el perfil completo y el gate deja de dispararse, sin tener que reemitir el token.

## Decisiones que tomé yo

No las discutimos; quedan marcadas para que se puedan revisar.

- **`email_verified` es obligatorio también para crear cuenta**, no solo para vincular. El correo es la identidad de la cuenta y el canal de avisos, así que sin verificar no se acepta.
- **El estado del perfil viaja en el DTO de sesión** que devuelven `/api/auth/google`, el login y `GET /api/auth/me`. Es un campo añadido, compatible con cualquier consumidor que ignore campos JSON que no conoce. Esto evita una segunda llamada en el callback y le da al layout algo que leer en cada navegación.
- **Ni el correo ni el nombre se sincronizan** en logins posteriores, aunque hayan cambiado en Google. El `sub` es la llave de login; `Usuario.Correo` y `Cliente.Correo` quedan como se registraron. Sincronizarlos obligaría a resolver choques con los índices únicos de ambas tablas y a decidir si la ficha del taller sigue al Gmail de la persona, y eso es una decisión del taller, no del login. Cambiar el correo de una ficha es un flujo aparte.
- **Un empleado cuyo Gmail no está en el sistema** obtiene, al entrar por Google, una cuenta de cliente normal. Es coherente: en ese momento está actuando como cliente.
- **El rol Cliente se asigna al crear la cuenta de Google**, antes de que exista la ficha. Sin eso, un empleado y un cliente recién llegado serían indistinguibles por `ClienteId`.
- **Vincular una cuenta a Google es un evento auditable.** `CambioAuditoria.Campos[typeof(Usuario)]` es una lista blanca explícita, así que hay que agregarle `GoogleId` o la escritura de la regla 2 produciría `anteriores == nuevos` y no registraría nada. `VersionCredenciales` **no** entra en esa lista, igual que `PasswordHash` no está.
- **Al endpoint nuevo no se le aplica la política `"registro"` tal como está.** Reparte por `RemoteIpAddress`, y como las llamadas del portal salen del servidor de Vercel, todas caen en el mismo balde: los usuarios legítimos se limitarían entre sí. La forma de proteger este endpoint queda al implementador, pero copiar esa política sería un error.

## Lo que queda al criterio de quien implemente

- Nombres exactos de columnas y forma de la migración.
- Forma de los DTOs, tanto de la respuesta del endpoint como del endpoint de completar perfil.
- Cómo `apiFetch` recibe y adjunta el token, y dónde vive la comprobación del gate en el árbol de layouts.
- Manejo y redacción de los errores en el front, incluido el `?error=` que ya usa el callback.
- Cómo se protege el endpoint nuevo contra abuso, visto que la política existente no sirve.
- Estrategia de pruebas.

## Notas sobre cosas ajenas a este cambio

- **El límite de intentos de `/api/auth/registro` no funciona como parece.** La política `"registro"` en `Program.cs` reparte por `contexto.Connection.RemoteIpAddress`, pero `apiFetch` es server only y las llamadas llegan desde el servidor de Vercel sin `X-Forwarded-For`. No son 5 intentos por persona cada 10 minutos: es un único balde global de 5 para todos los usuarios juntos. Bug preexistente, fuera del alcance, vale arreglarlo aparte.
