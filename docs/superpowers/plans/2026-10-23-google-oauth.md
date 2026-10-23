# Registro e inicio de sesión con Google — Plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usar superpowers:subagent-driven-development (recomendada) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** que un cliente pueda crear cuenta e iniciar sesión con Google sin contraseña, entregue su teléfono antes de usar el portal, y que quien ya tenía cuenta propia con ese correo quede vinculado en lugar de duplicado.

**Arquitectura:** el front ya hace el flujo OAuth completo (Authorization Code + PKCE) y manda el `id_token` a `POST /api/auth/google`, endpoint que falta. La API lo valida con `Google.Apis.Auth` exigiendo el `aud`, y un servicio nuevo `CuentaGoogleService` resuelve la cuenta en un orden fijo: por `GoogleId`, por correo de cuenta de cliente pura, o creación. `Usuario.PasswordHash` pasa a opcional y una columna nueva `VersionCredenciales` toma el lugar del hash como fuente del claim `cred_ver`. El perfil incompleto no es una bandera: es rol Cliente con `ClienteId` nulo, y el layout del portal redirige mientras lo esté.

**Stack:** .NET 8 (ASP.NET Core Web API, EF Core con Npgsql), `Google.Apis.Auth`; Next.js 16 con React 19, Tailwind 4 y daisyUI.

**Spec:** `docs/superpowers/specs/2026-10-23-google-oauth-design.md` (en el repo del front)

## Restricciones globales

- Dos repos. Raíz del front: `C:\Users\roood\OneDrive\Escritorio\Carpetas\Octavo Semestre\Desarrollo Web\Frontlossantos`. Directorio de trabajo para `dotnet`: `C:\Users\roood\source\repos\CustomCore.API\CustomCore.API` (la raíz de git está un nivel arriba).
- Rama del front: `Local/FeatureAutenticacion`. Arranca con cambios sin commitear en `src/app/auth/google/callback/route.ts`, `src/features/auth/actions.ts`, `src/features/auth/session.ts` y `src/app/panel/` sin seguimiento. Son el punto de partida, no basura: no revertirlos.
- **Rodrigo hace todos los commits.** Ninguna tarea ejecuta `git commit`. Donde el plan dice "punto de commit", hay que detenerse, resumirle qué cambió y esperar. Tampoco se hace `push`.
- Toda migración se aplica solo a la base de `ConnectionStrings:Default`, que debe apuntar a `localhost`. Verificar el host **sin imprimir la cadena** antes de cualquier `dotnet ef database update`. **Supabase no se toca.**
- El proyecto no tiene pruebas automatizadas, en ninguno de los dos repos. La verificación de cada tarea es `dotnet build --nologo -v q` (0 errores, sin advertencias nuevas) o `npm run build` según el repo, más las comprobaciones que indique la tarea. La Tarea 6 recorre todos los escenarios contra la API y el front locales.
- Comentarios con el formato del proyecto: `//[INICIO][23/10/2026][Rodriale][motivo]` … `//[FIN][23/10/2026][Rodriale][motivo]`. No se tocan los comentarios de `jgarciad8` ni los existentes, salvo para mover código que cambia.
- Sin sobreingeniería: ni interfaces, ni repositorios, ni capas nuevas. Consultas proyectadas y en una sola ida a la base cuando se pueda.
- Códigos de estado del endpoint de Google, que el front usa para distinguir el error: `401` token inválido, `aud` ajeno o `email_verified` falso; `403` el correo pertenece a una cuenta que carga algún rol distinto de Cliente; `409` el correo ya tiene ficha de `Cliente` del taller.
- El scope pedido a Google es `openid email profile`. No hay teléfono en el `id_token`; no intentar sacarlo de ahí.

## Foco de revisión

Cinco escenarios que la spec implica y que ninguna tarea comprueba sola. Cada uno queda clavado en la tarea que lo cubre y se ejercita en la Tarea 6.

1. **`id_token` firmado por Google pero emitido para otra aplicación:** debe responder `401` sin resolver ninguna cuenta. Sin `ValidationSettings.Audience` el token pasa y cualquiera entra a la cuenta de un cliente sin contraseña. Lo cubre la Tarea 2 (Paso 3) y lo ejercita la Tarea 6 (escenario 2).
2. **Cuenta de Google intentando entrar por `/api/auth/login`:** mismo `401` y mismo costo en tiempo que un correo que no existe. `PasswordService.Verificar` corta temprano con hash nulo, así que sin el `?? HashFicticio` intacto el tiempo de respuesta delata que ese correo tiene cuenta. Lo cubre la Tarea 1 (Paso 6) y lo ejercita la Tarea 6 (escenario 7).
3. **Correo que pertenece a una cuenta con rol Cliente y además un rol de empleado:** `403`, sin escribir el `GoogleId`. Si la prueba fuera solo "tiene rol Cliente", Google se vuelve una puerta a un token con permisos de empleado. Lo cubre la Tarea 2 (Paso 4) y lo ejercita la Tarea 6 (escenario 5).
4. **Cuenta encontrada con `Activo = false`:** rechazo antes de cualquier escritura. Sin esto se le escribe el `GoogleId` a una cuenta inhabilitada y se emite un token que muere en la primera petición, porque `OnTokenValidated` exige `Activo`. Lo cubre la Tarea 2 (Paso 4) y lo ejercita la Tarea 6 (escenario 6).
5. **Completar perfil cuando el taller creó una ficha con ese correo mientras tanto:** `409` y la pantalla debe ofrecer cerrar sesión. Sin la salida, la persona queda encerrada en un formulario que nunca puede tener éxito. Lo cubren la Tarea 3 (Paso 2) y la Tarea 5 (Paso 3), y lo ejercita la Tarea 6 (escenario 9).

---

## Mapa de archivos

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| `CustomCore.API.csproj` | Paquete `Google.Apis.Auth` | 2 |
| `Configuracion/OpcionesGoogle.cs` (nuevo) | Client ID de Google | 2 |
| `Entidades/Usuario.cs` | `PasswordHash` opcional, `GoogleId`, `VersionCredenciales` | 1 |
| `Entidades/UsuarioConfiguracion.cs` | Hash opcional e índice único filtrado de `GoogleId` | 1 |
| `Seguridad/JwtService.cs` | `cred_ver` desde `VersionCredenciales` | 1 |
| `Seguridad/ConfiguracionSeguridad.cs` | `OnTokenValidated` (T1); `OpcionesGoogle` y registro del servicio (T2) | 1, 2 |
| `Servicios/AuthService.cs` | Login con hash nulo y rotación al cambiar contraseña | 1 |
| `Servicios/RegistroService.cs` | Nuevo parámetro del DTO de sesión | 1 |
| `Data/Auditoria/CambioAuditoria.cs` | `GoogleId` y `ClienteId` auditables | 1 |
| `Data/Migrations/*_CuentasConGoogle.cs` (nuevo) | Esquema y relleno de `VersionCredenciales` | 1 |
| `Dtos/AuthDtos.cs` | `PerfilCompleto`, `GoogleLoginRequest`, `CompletarPerfilRequest` | 1, 2, 3 |
| `Servicios/CuentaGoogleService.cs` (nuevo) | Validar el token, resolver la cuenta (T2); crear la ficha (T3) | 2, 3 |
| `Controllers/AuthController.cs` | `POST google` (T2), `POST perfil` (T3) | 2, 3 |
| `src/lib/api.ts` | Manda el JWT | 4 |
| `src/features/auth/session.ts` | Leer el token y cerrar sesión | 4 |
| `src/features/auth/types.ts` | `perfilCompleto` en la sesión | 4 |
| `src/app/panel/layout.tsx` (nuevo) | Guarda de sesión y gate del perfil | 4 |
| `src/app/auth/google/callback/route.ts` | Destino según el perfil y errores por estado | 5 |
| `src/app/completar-perfil/page.tsx` (nuevo) | Pantalla del gate, con salida | 5 |
| `src/features/auth/components/CompletarPerfilForm.tsx` (nuevo) | Formulario del teléfono | 5 |
| `src/features/auth/actions.ts` | `completarPerfil` y `cerrarSesion` | 5 |

---

### Tarea 1: Modelo, `VersionCredenciales` y migración

Es la tarea grande y no se puede partir: volver `PasswordHash` opcional rompe la compilación de `JwtService`, `ConfiguracionSeguridad` y `AuthService`, y la migración solo se genera cuando el proyecto compila. Al terminar, el login por contraseña sigue funcionando igual y nada de Google existe todavía.

**Archivos:**
- Crear: `Data/Migrations/<marca>_CuentasConGoogle.cs` (generada y luego editada)
- Modificar: `Entidades/Usuario.cs`, `Entidades/UsuarioConfiguracion.cs`, `Seguridad/JwtService.cs`, `Seguridad/ConfiguracionSeguridad.cs`, `Servicios/AuthService.cs`, `Servicios/RegistroService.cs`, `Data/Auditoria/CambioAuditoria.cs`, `Dtos/AuthDtos.cs`

**Interfaces:**
- Produce:
  - `Usuario.PasswordHash : string?`, `Usuario.GoogleId : string?`, `Usuario.VersionCredenciales : string` (con valor por defecto en la propiedad, así ningún sitio que cree un `Usuario` tiene que asignarla).
  - `JwtService.CrearToken(UsuarioSesionDto usuario, string versionCredenciales) : LoginResponse` y `JwtService.CoincideVersionCredenciales(string? version, int idUsuario, string versionCredenciales) : bool` — mismas firmas de antes, pero el segundo argumento ya no es el hash.
  - `UsuarioSesionDto(int IdUsuario, string NombreCompleto, string Correo, bool PerfilCompleto)`.

- [ ] **Paso 1: Verificar que `Default` apunta a local**

```powershell
dotnet user-secrets list | ForEach-Object { if ($_ -match '^ConnectionStrings:Default = (.*)$') { ([regex]::Match($matches[1],'(?i)host=([^;]+)')).Groups[1].Value } }
```

Esperado: `localhost`. Si sale otra cosa, **detenerse** y avisarle a Rodrigo.

- [ ] **Paso 2: Columnas nuevas en `Usuario`**

En `Entidades/Usuario.cs`, cambiar `public required string PasswordHash { get; set; }` por `public string? PasswordHash { get; set; }`, y agregar después de `Activo`:

```csharp
    //[INICIO][23/10/2026][Rodriale][Cuenta de Google: el sub es la llave, no el correo, porque el correo puede cambiar y el sub no]
    public string? GoogleId { get; set; }
    //[FIN][23/10/2026][Rodriale][Cuenta de Google]

    //[INICIO][23/10/2026][Rodriale][De aquí sale cred_ver. Antes salía del PasswordHash, que una cuenta de Google no tiene. Regenerarla mata las sesiones vivas]
    public string VersionCredenciales { get; set; } = Guid.NewGuid().ToString("N");
    //[FIN][23/10/2026][Rodriale][De aquí sale cred_ver]
```

- [ ] **Paso 3: Mapeo**

En `Entidades/UsuarioConfiguracion.cs`:

1. Cambiar `builder.Property(u => u.PasswordHash).IsRequired();` por `builder.Property(u => u.PasswordHash);`
2. Cambiar `builder.ToTable("Usuarios");` por la versión con la restricción que sostiene el invariante de la spec, "toda cuenta debe tener al menos una credencial":

```csharp
        //[INICIO][23/10/2026][Rodriale][Con el hash ya opcional, esto es lo único que impide una cuenta sin ninguna forma de entrar]
        builder.ToTable("Usuarios", t => t.HasCheckConstraint(
            "CK_Usuarios_AlMenosUnaCredencial",
            @"""PasswordHash"" IS NOT NULL OR ""GoogleId"" IS NOT NULL"));
        //[FIN][23/10/2026][Rodriale][Lo único que impide una cuenta sin ninguna forma de entrar]
```

3. Antes del bloque de `Sucursal`, agregar:

```csharp
        //[INICIO][23/10/2026][Rodriale][Mismo truco del filtro que ClienteId: en Postgres los NULL no chocan, así que esto solo exige que dos cuentas no compartan la misma cuenta de Google]
        builder.Property(u => u.GoogleId).HasMaxLength(255);
        builder.HasIndex(u => u.GoogleId)
            .IsUnique()
            .HasFilter(@"""GoogleId"" IS NOT NULL");
        //[FIN][23/10/2026][Rodriale][Mismo truco del filtro que ClienteId]

        builder.Property(u => u.VersionCredenciales).HasMaxLength(64).IsRequired();
```

- [ ] **Paso 4: `cred_ver` desde `VersionCredenciales`**

En `Seguridad/JwtService.cs`, renombrar el parámetro `passwordHash` a `versionCredenciales` en `CrearToken`, `CrearVersionCredenciales` y `CoincideVersionCredenciales`, y en el cuerpo de `CrearVersionCredenciales` cambiar el prefijo `"credenciales-v1:"` por `"credenciales-v2:"`, concatenando `versionCredenciales` donde antes iba el hash.

El cambio de prefijo es a propósito: deja constancia de que la fuente cambió y garantiza que ningún token viejo coincida por accidente.

- [ ] **Paso 5: `OnTokenValidated` lee la columna nueva**

En `Seguridad/ConfiguracionSeguridad.cs`, dentro de `OnTokenValidated`, cambiar la proyección `.Select(u => new { u.PasswordHash })` por `.Select(u => new { u.VersionCredenciales })` y la llamada `CoincideVersionCredenciales(version, idUsuario, usuario.PasswordHash)` por `CoincideVersionCredenciales(version, idUsuario, usuario.VersionCredenciales)`.

- [ ] **Paso 6: Login con hash nulo y rotación al cambiar contraseña**

En `Servicios/AuthService.cs`:

1. En `IniciarSesionAsync`, la línea `passwordService.Verificar(request.Password, usuario?.PasswordHash ?? HashFicticio)` **se deja exactamente como está**. Ahora absorbe también el caso de una cuenta de Google (hash nulo), que es justo lo que se busca: `Verificar` corta temprano con hash nulo sin hacer el trabajo de BCrypt, así que sin ese `?? HashFicticio` una cuenta de Google respondería medible y notoriamente más rápido que un correo inexistente, delatando que existe. Agregar encima el comentario:

```csharp
        //[INICIO][23/10/2026][Rodriale][El ?? HashFicticio ahora también cubre a las cuentas de Google: con hash nulo Verificar corta antes de BCrypt y el tiempo de respuesta delataría que el correo existe]
```

2. En la llamada a `jwtService.CrearToken`, pasar `usuario.VersionCredenciales` en lugar de `usuario.PasswordHash`, y agregar el cuarto argumento del DTO: `usuario.ClienteId is not null`.

3. En `ObtenerUsuarioActualAsync`, agregar a la proyección el cuarto argumento `u.ClienteId != null`.

4. En `CambiarPasswordAsync`, agregar a la expresión de `ActualizarAuditadoAsync` un segundo `SetProperty` que ponga `VersionCredenciales` en `Guid.NewGuid().ToString("N")`, para que cambiar la contraseña siga matando las sesiones anteriores.

- [ ] **Paso 7: El DTO de sesión lleva el estado del perfil**

En `Dtos/AuthDtos.cs`, reemplazar `UsuarioSesionDto` por:

```csharp
//[INICIO][23/10/2026][Rodriale][PerfilCompleto es ClienteId no nulo: una cuenta de Google nace sin ficha porque Cliente.Telefono es obligatorio y Google no lo da]
public record UsuarioSesionDto(
    int IdUsuario,
    string NombreCompleto,
    string Correo,
    bool PerfilCompleto);
//[FIN][23/10/2026][Rodriale][PerfilCompleto es ClienteId no nulo]
```

En `Servicios/RegistroService.cs`, en el `new UsuarioSesionDto(...)` final, agregar `true` como cuarto argumento (el registro por contraseña crea la ficha en la misma transacción), y cambiar `usuario.PasswordHash` por `usuario.VersionCredenciales` en la llamada a `CrearToken`.

- [ ] **Paso 8: Campos auditables**

En `Data/Auditoria/CambioAuditoria.cs`, en `[typeof(Usuario)]`, agregar `nameof(Usuario.GoogleId)` y `nameof(Usuario.ClienteId)` después de `nameof(Usuario.SucursalId)`.

`VersionCredenciales` **no** entra en la lista, igual que `PasswordHash` nunca estuvo: es un valor de seguridad rotatorio y no tiene por qué quedar escrito en la bitácora.

- [ ] **Paso 9: Compilar**

Ejecutar: `dotnet build --nologo -v q`
Esperado: `0 Errores`. Si queda alguna referencia que pase el hash a los métodos de `JwtService`, búscala con `grep -rn "PasswordHash" --include=*.cs . | grep -v Migrations`.

- [ ] **Paso 10: Generar la migración**

Ejecutar: `dotnet ef migrations add CuentasConGoogle`
Esperado: se crean `Data/Migrations/<marca>_CuentasConGoogle.cs` y su `.Designer.cs`, y se actualiza `AppDbContextModelSnapshot.cs`.

- [ ] **Paso 11: Rellenar `VersionCredenciales` en las filas existentes**

El `Up` que genera EF agrega `VersionCredenciales` como `NOT NULL` con cadena vacía por defecto, lo que dejaría a todas las cuentas compartiendo el mismo valor. En el `.cs` (no en el `.Designer.cs`), después del `AddColumn` de `VersionCredenciales` y antes del `CreateIndex` de `GoogleId`, agregar:

```csharp
            //[INICIO][23/10/2026][Rodriale][Un valor distinto por cuenta; si todas compartieran el mismo, cred_ver dejaría de distinguir nada]
            migrationBuilder.Sql("""
                UPDATE customcore."Usuarios"
                SET "VersionCredenciales" = REPLACE(gen_random_uuid()::text, '-', '');
                """);
            //[FIN][23/10/2026][Rodriale][Un valor distinto por cuenta]
```

Si `gen_random_uuid()` no existe en esta base, usar `md5(random()::text || "IdUsuario"::text)`.

- [ ] **Paso 12: Confirmar que el modelo y la migración cuadran**

Ejecutar: `dotnet build --nologo -v q` y luego `dotnet ef migrations has-pending-model-changes --no-build`
Esperado: `0 Errores` y `No changes have been made to the model since the last migration.`

- [ ] **Paso 13: Aplicar y comprobar**

```powershell
dotnet ef database update
```

Luego, con el ayudante de `psql` de la sesión (ver el plan de sucursales, Tarea 2 Paso 12, para definirlo):

```powershell
Sql 'SELECT COUNT(*) FROM customcore."Usuarios" WHERE "VersionCredenciales" IS NULL OR "VersionCredenciales" = '''''
Sql 'SELECT COUNT(DISTINCT "VersionCredenciales") = COUNT(*) FROM customcore."Usuarios"'
```

Esperado: `0` y `t`.

- [ ] **Paso 14: Comprobar que el login por contraseña sigue vivo**

Levantar la API (`dotnet run`) y hacer `POST /api/auth/login` con una cuenta conocida.
Esperado: `200` con `usuario.perfilCompleto` presente, y un `GET /api/auth/me` con ese token devuelve `200`. Un token emitido **antes** de la migración ahora responde `401`: es el cierre de sesión masivo de una sola vez que la spec acepta.

- [ ] **Paso 15: Probar la reversión ida y vuelta**

```powershell
dotnet ef database update CuentasDeCliente
dotnet ef database update
```

Esperado: las dos actualizaciones terminan sin errores.

- [ ] **Paso 16: Punto de commit**

Detenerse. Resumirle a Rodrigo: modelo de `Usuario`, `cred_ver` desde `VersionCredenciales`, migración aplicada, y que todas las sesiones vivas se cerraron.

---

### Tarea 2: Validar el `id_token` y resolver la cuenta

**Archivos:**
- Crear: `Configuracion/OpcionesGoogle.cs`, `Servicios/CuentaGoogleService.cs`
- Modificar: `CustomCore.API.csproj`, `appsettings.json`, `Seguridad/ConfiguracionSeguridad.cs`, `Dtos/AuthDtos.cs`, `Controllers/AuthController.cs`

**Interfaces:**
- Consume (Tarea 1): `Usuario.GoogleId`, `Usuario.VersionCredenciales`, `UsuarioSesionDto` con `PerfilCompleto`.
- Produce:
  - `OpcionesGoogle { const string Seccion = "Google"; string ClientId { get; set; } }`
  - `GoogleLoginRequest(string IdToken)`
  - `CuentaGoogleService.IniciarSesionAsync(GoogleLoginRequest request, CancellationToken cancellationToken) : Task<LoginResponse?>` — `null` significa token inválido, `aud` ajeno o correo sin verificar, y el controlador lo convierte en `401`.
  - `POST /api/auth/google`, anónimo, `200` con `LoginResponse`.

- [ ] **Paso 1: Paquete y configuración**

Ejecutar en el directorio del proyecto: `dotnet add package Google.Apis.Auth`

Crear `Configuracion/OpcionesGoogle.cs` siguiendo el molde de `OpcionesJwt`: `Seccion = "Google"` y una sola propiedad `ClientId` inicializada en `string.Empty`.

En `appsettings.json`, agregar la sección declarada y vacía, como `ConnectionStrings:Default`:

```json
  "Google": {
    "ClientId": ""
  },
```

El valor real va en User Secrets en local y como variable de entorno en el despliegue. Es el **mismo** client ID que usa el front en `GOOGLE_CLIENT_ID`. No es secreto, pero se trata igual que el resto para no partir el patrón del proyecto.

- [ ] **Paso 2: Leer, validar y registrar**

En `Seguridad/ConfiguracionSeguridad.cs`, después del bloque de validación de `OpcionesJwt` (tras `var claveFirma = ...`), leer `OpcionesGoogle` con `configuracion.GetSection(OpcionesGoogle.Seccion).Get<OpcionesGoogle>()`, lanzar `InvalidOperationException("Debes configurar Google:ClientId.")` si falta o viene en blanco, y registrarlo junto al servicio nuevo:

```csharp
        servicios.AddSingleton(opcionesGoogle);
        servicios.AddScoped<CuentaGoogleService>();
```

Falla al arrancar, igual que `Jwt` y `Stripe`: una API que acepta tokens de Google sin saber para quién fueron emitidos es peor que una que no arranca.

- [ ] **Paso 3: Validación del token**

Crear `Servicios/CuentaGoogleService.cs` con el constructor `(AppDbContext db, JwtService jwtService, OpcionesGoogle opcionesGoogle)`.

Un método privado valida y devuelve los datos que interesan, o `null`:

```csharp
    private sealed record IdentidadGoogle(string Sub, string Correo, string Nombre);

    private async Task<IdentidadGoogle?> ValidarAsync(string idToken)
```

Dentro: `GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings { Audience = [opcionesGoogle.ClientId] })`, envuelto en `try`/`catch (InvalidJwtException)`.

Devuelve `null` en tres casos, que para el cliente son el mismo: firma inválida, `aud` de otra aplicación, o `EmailVerified == false`. No se lanza excepción porque `Middleware/ManejadorGlobalExcepciones.cs` no traduce nada a `401`; el patrón del proyecto para eso es que el servicio devuelva `null` y el controlador responda, igual que hace `AuthService.IniciarSesionAsync` con las credenciales malas.

El `Audience` no es opcional: sin él, `ValidateAsync` comprueba la firma pero no para quién se emitió el token, y la API aceptaría un `id_token` de cualquier otra aplicación de Google, resolviendo la cuenta por `sub` o correo. Dejar el motivo escrito en el comentario del bloque.

El correo se normaliza con `.Trim().ToLowerInvariant()` antes de cualquier búsqueda, igual que en `AuthService` y `RegistroService`.

- [ ] **Paso 4: Resolver la cuenta**

En el mismo archivo, `IniciarSesionAsync` sigue este orden exacto. El orden importa: cada regla asume que las anteriores no se cumplieron.

1. `Usuario` con ese `GoogleId` → login.
2. `Usuario` con ese correo. Si existe, se necesita saber si es una cuenta de cliente pura, con una sola consulta proyectada:
   - `bool TieneRolCliente` — tiene un `UsuarioRol` cuyo `Rol.Nombre == RegistroService.RolCliente`.
   - `bool TieneOtroRol` — tiene algún `UsuarioRol` cuyo `Rol.Nombre != RegistroService.RolCliente`.

   Si `TieneRolCliente && !TieneOtroRol` → se le escribe el `GoogleId` y entra. En cualquier otro caso → `403`, sin escribir nada.
3. Ficha de `Cliente` con ese correo y sin `Usuario` → `ConflictoNegocioException` con el texto exacto que ya usa `RegistroService`: `"Ese correo ya está registrado en el taller. Comunícate con nosotros para activar tu acceso."`
4. Nada → crear la cuenta: `Usuario` con `NombreCompleto` y `Correo` del token, `PasswordHash = null`, `GoogleId = sub`, `SucursalId = null`, `ClienteId = null`, más la fila de `UsuarioRol` con el rol Cliente, dentro de una transacción envuelta en `db.Database.CreateExecutionStrategy()` y con el mismo chequeo de existencia del rol que hace `RegistroService` (si falta, `InvalidOperationException`).

En los casos 1 y 2, si la cuenta encontrada tiene `Activo = false` → rechazo **antes de escribir el `GoogleId`**, como hace el login por contraseña en `AuthService.cs:43`. Sin eso se marcaría una cuenta inhabilitada y se emitiría un token que muere en la primera petición autenticada, porque `OnTokenValidated` exige `Activo`.

La escritura del `GoogleId` del caso 2 pasa por `ActualizarAuditadoAsync`, para que la vinculación quede en la bitácora; la Tarea 1 ya metió `GoogleId` en la lista blanca.

En el caso 1 **no se actualiza nada**: ni el correo ni el nombre, aunque hayan cambiado en Google. Es decisión de la spec. Sincronizarlos obligaría a resolver choques con los índices únicos de `Usuarios` y `Clientes`, y si la ficha del taller debe seguir al Gmail de la persona lo decide el taller, no el login.

Devuelve `jwtService.CrearToken(new UsuarioSesionDto(id, nombre, correo, clienteId is not null), versionCredenciales)`, donde el nombre y el correo salen de la **base**, no del token, por lo mismo del párrafo anterior.

- [ ] **Paso 5: DTO y endpoint**

En `Dtos/AuthDtos.cs`, agregar `GoogleLoginRequest` con un solo campo `string IdToken`, `[Required]` y `[MaxLength(4096)]` (un `id_token` de Google ronda el kilobyte; el techo evita que manden un cuerpo enorme).

En `Controllers/AuthController.cs`, inyectar `CuentaGoogleService` en el constructor primario y agregar el endpoint. Cuando el servicio devuelve `null`, responder con `Problem(statusCode: StatusCodes.Status401Unauthorized, ...)` tal como hace `Login` con las credenciales inválidas, con un título y detalle que **no** distingan entre firma mala, `aud` ajeno y correo sin verificar: al cliente legítimo no le sirve el detalle y al atacante sí. Los casos de `403` y `409` no pasan por aquí; los lanza el servicio y los traduce el middleware.

Atributos, siguiendo el estilo de `Login`:

```csharp
    [AllowAnonymous]
    [HttpPost("google")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
```

No se le aplica la política `"registro"` de limitación de intentos: reparte por `RemoteIpAddress`, y como las llamadas del portal llegan desde el servidor de Vercel, todas caen en el mismo balde y los usuarios legítimos se limitarían entre sí. Dejar el motivo en un comentario para que nadie la agregue "por simetría".

- [ ] **Paso 6: Compilar y probar a mano**

Ejecutar: `dotnet build --nologo -v q`
Esperado: `0 Errores`.

Con la API corriendo, `POST /api/auth/google` con `{"idToken":"cualquier-cosa"}`.
Esperado: `401`, y **no** un `500`.

- [ ] **Paso 7: Punto de commit**

Detenerse y resumirle a Rodrigo el endpoint nuevo y los cuatro códigos de estado.

---

### Tarea 3: Completar el perfil

**Archivos:**
- Modificar: `Servicios/CuentaGoogleService.cs`, `Dtos/AuthDtos.cs`, `Controllers/AuthController.cs`

**Interfaces:**
- Consume (Tarea 2): `CuentaGoogleService`.
- Produce:
  - `CompletarPerfilRequest(string Telefono)`
  - `CuentaGoogleService.CompletarPerfilAsync(int idUsuario, CompletarPerfilRequest request, CancellationToken cancellationToken) : Task`
  - `POST /api/auth/perfil`, autenticado, `204` sin cuerpo.

- [ ] **Paso 1: DTO**

En `Dtos/AuthDtos.cs`, agregar `CompletarPerfilRequest` con un solo campo `string Telefono`, copiando **las mismas** anotaciones que ya usa `RegistroRequest.Telefono`: `[Required]`, `[RegularExpression(@"^\+[1-9]\d{7,14}$")]` con el mismo mensaje, y `[MaxLength(20)]`. El formato E.164 no es capricho: es lo que exige WhatsApp.

- [ ] **Paso 2: Crear la ficha**

En `CuentaGoogleService`, `CompletarPerfilAsync` carga el `Usuario` (`IdUsuario`, `Activo`, `ClienteId`, `NombreCompleto`, `Correo`) y:

- Si no existe, no está activo, o ya tiene `ClienteId` → `ConflictoNegocioException` indicando que el perfil ya está completo. No se permite reescribir una ficha ya vinculada por esta vía.
- Si ya existe una ficha de `Cliente` con ese correo → `ConflictoNegocioException` con el mismo texto del taller del caso 3 de la Tarea 2. Es el callejón del Foco de revisión 5: la pantalla tiene que ofrecer cerrar sesión, y eso lo resuelve la Tarea 5.
- Si no, dentro de una transacción envuelta en `CreateExecutionStrategy()`: crear el `Cliente` con `NombreCompleto` y `Correo` del `Usuario`, `Telefono` del request ya recortado y `Nit = null`; guardar; y escribir `ClienteId` en el `Usuario` con `ActualizarAuditadoAsync`.

- [ ] **Paso 3: Endpoint**

En `AuthController`, agregar `POST perfil` con `[Authorize]`, sacando el id del usuario del claim `Sub` con el mismo `int.TryParse` que ya usan `ObtenerUsuarioActual` y `CambiarPassword`, devolviendo `Unauthorized()` si no parsea y `NoContent()` al terminar. Declarar `204`, `400`, `401` y `409`.

- [ ] **Paso 4: Compilar**

Ejecutar: `dotnet build --nologo -v q`
Esperado: `0 Errores`.

- [ ] **Paso 5: Punto de commit**

---

### Tarea 4: El front sostiene la sesión

**Archivos:**
- Crear: `src/app/panel/layout.tsx`
- Modificar: `src/lib/api.ts`, `src/features/auth/session.ts`, `src/features/auth/types.ts`

**Interfaces:**
- Consume (Tareas 1 y 3): `usuario.perfilCompleto` en la respuesta, `GET /api/auth/me`.
- Produce:
  - `getSessionToken() : Promise<string | undefined>` y `destroySession() : Promise<void>` en `session.ts`.
  - `UsuarioSesion` con `perfilCompleto: boolean` en `types.ts`.
  - `apiFetch` manda `Authorization: Bearer <token>` cuando hay cookie de sesión.

- [ ] **Paso 1: Tipos**

En `src/features/auth/types.ts`, agregar `perfilCompleto: boolean;` a `UsuarioSesion`.

- [ ] **Paso 2: Leer y borrar la sesión**

En `src/features/auth/session.ts`, exportar dos funciones junto a `createSession`, reutilizando la constante `SESSION_COOKIE` que ya existe:

```ts
export async function getSessionToken(): Promise<string | undefined>
export async function destroySession(): Promise<void>
```

`destroySession` borra la cookie con el mismo `path: "/"` con el que se creó.

- [ ] **Paso 3: `apiFetch` manda el token**

En `src/lib/api.ts`, antes del `fetch`, leer el token con `getSessionToken()` y, si existe, añadir `Authorization: Bearer ${token}` a las cabeceras, sin pisar un `Authorization` que venga en `init.headers`.

Se adjunta siempre que haya cookie, sin un flag por llamada: `apiFetch` es `server-only` y solo habla con nuestra API, y los endpoints de login son anónimos, así que un token viejo colgado de un login no cambia nada.

Cuidado con el ciclo de imports: `session.ts` no debe importar de `api.ts`. Hoy no lo hace.

- [ ] **Paso 4: Guarda y gate del portal**

Crear `src/app/panel/layout.tsx` como componente de servidor que:

1. Lee el token. Si no hay, `redirect("/login")`.
2. Pide `GET /api/auth/me` con `apiFetch<UsuarioSesion>`. Si lanza `ApiError` con `401`, borra la sesión y `redirect("/login")`.
3. Si `!usuario.perfilCompleto`, `redirect("/completar-perfil")`.
4. Si todo está bien, devuelve `children`.

El estado se lee del servidor en cada navegación, no de un claim del token: así, en cuanto la Tarea 3 crea la ficha, la siguiente navegación ya pasa el gate sin reemitir nada.

`/completar-perfil` va **fuera** de `src/app/panel/`, o este layout lo redirigiría a sí mismo en un bucle.

- [ ] **Paso 5: Compilar**

Ejecutar: `npm run build`
Esperado: compila sin errores de tipos. `/panel` sin cookie de sesión redirige a `/login`.

- [ ] **Paso 6: Punto de commit**

---

### Tarea 5: Pantalla de completar perfil y destinos del callback

**Archivos:**
- Crear: `src/app/completar-perfil/page.tsx`, `src/features/auth/components/CompletarPerfilForm.tsx`
- Modificar: `src/features/auth/actions.ts`, `src/app/auth/google/callback/route.ts`

**Interfaces:**
- Consume (Tareas 3 y 4): `POST /api/auth/perfil`, `getSessionToken`, `destroySession`.
- Produce: `completarPerfil(prev, formData)` y `cerrarSesion()` en `actions.ts`.

- [ ] **Paso 1: Acciones**

En `src/features/auth/actions.ts`, agregar dos acciones de servidor siguiendo el molde de `login` (mismo manejo de `ApiError`, mismo tipo de estado con `error`):

- `completarPerfil`: valida que el teléfono no venga vacío, llama a `POST /api/auth/perfil`, y al terminar `redirect(RUTA_DESPUES_DE_LOGIN)`. Con `409`, devuelve en el estado el mensaje de que ese correo ya está registrado en el taller.
- `cerrarSesion`: `destroySession()` y `redirect("/login")`.

- [ ] **Paso 2: Formulario**

Crear `CompletarPerfilForm.tsx` con el mismo patrón de `LoginForm.tsx` (`useActionState`, estilos daisyUI del proyecto): un campo de teléfono con `placeholder="+50255551234"`, el error del estado, y el botón de envío.

- [ ] **Paso 3: Página, con salida**

Crear `src/app/completar-perfil/page.tsx`: si no hay token, `redirect("/login")`; si no, explica en una línea por qué hace falta el teléfono, monta el formulario y **ofrece cerrar sesión** con un botón que llame a `cerrarSesion`.

Ese botón es el requisito del Foco de revisión 5: si el taller creó una ficha con ese correo, el formulario nunca podrá tener éxito, y sin esta salida la persona queda encerrada con una sesión válida y ninguna pantalla accesible.

- [ ] **Paso 4: Destinos del callback**

En `src/app/auth/google/callback/route.ts`, después de `createSession(sesion)`, redirigir a `/completar-perfil` si `!sesion.usuario.perfilCompleto`, y a `RUTA_DESPUES_DE_LOGIN` si sí.

En el `catch`, distinguir por estado antes de caer al error genérico, porque `ApiError` solo trae el `status` y el `statusText`:

- `403` → `/login?error=empleado`
- `409` → `/login?error=taller`
- cualquier otro → el `/login?error=google` que ya existe

Revisar `src/features/auth/components/OAuthError.tsx` y agregar el texto de los dos casos nuevos: para `empleado`, que esa cuenta entra con su contraseña; para `taller`, el mensaje de comunicarse con el taller.

Ojo con `redirect()` de Next: lanza una excepción para redirigir, así que las llamadas no pueden quedar dentro del `try` que atrapa el error de la API. En el archivo actual ya están fuera; mantenerlo así.

- [ ] **Paso 5: Compilar**

Ejecutar: `npm run build`
Esperado: compila sin errores de tipos.

- [ ] **Paso 6: Punto de commit**

---

### Tarea 6: Verificación de punta a punta

No toca código. Recorre los escenarios contra la API y el front locales, con el client ID de Google configurado en los dos lados.

**Preparación:** una cuenta de Google de prueba cuyo correo **no** exista en la base; un `Usuario` de cliente puro creado por `/api/auth/registro` con un segundo correo de Google disponible; un `Usuario` empleado con un tercer correo de Google; una ficha de `Cliente` sin cuenta con un cuarto correo.

- [ ] **Escenario 1 — Alta nueva:** entrar con Google con el correo que no existe. Termina en `/completar-perfil`. En la base: `Usuario` con `GoogleId`, `PasswordHash` nulo, `ClienteId` nulo y fila en `UsuarioRoles` con el rol Cliente.
- [ ] **Escenario 2 — `aud` ajeno (Foco 1):** mandar a `POST /api/auth/google` un `id_token` real emitido para otro client ID (sirve uno de cualquier otra app de Google Cloud, o alterar el `aud` de uno válido). Esperado: `401`, y ninguna cuenta creada ni modificada.
- [ ] **Escenario 3 — Login repetido:** volver a entrar con la cuenta del escenario 1. Resuelve por `GoogleId`, no crea nada nuevo, y sigue mandando a `/completar-perfil`.
- [ ] **Escenario 4 — Vinculación:** entrar con Google con el correo del cliente puro. Esperado: `200`, al `Usuario` existente se le escribe el `GoogleId`, **no** se crea un segundo usuario, y como ya tenía ficha entra directo a `/panel`. Comprobar que la bitácora registró el cambio. **Anti pre-hijacking:** el `PasswordHash` de esa cuenta queda nulo, un `POST /api/auth/login` con la contraseña anterior responde `401`, y un token emitido antes de vincular también responde `401`.
- [ ] **Escenario 5 — Empleado (Foco 3):** entrar con Google con el correo del empleado. Esperado: `403`, `/login?error=empleado`, y el `GoogleId` del empleado sigue nulo. Repetir con una cuenta que cargue rol Cliente **y** un rol de empleado: mismo `403`.
- [ ] **Escenario 6 — Cuenta inhabilitada (Foco 4):** poner `Activo = false` en la cuenta del escenario 1 y entrar con Google. Esperado: rechazo, y el `GoogleId` sin cambios respecto a antes del intento.
- [ ] **Escenario 7 — Canal de tiempo (Foco 2):** `POST /api/auth/login` con el correo de la cuenta de Google y cualquier contraseña, y con un correo que no existe. Esperado: `401` en ambos, con tiempos de respuesta del mismo orden. Si el de la cuenta de Google vuelve notoriamente más rápido, el `?? HashFicticio` se rompió.
- [ ] **Escenario 8 — Completar perfil:** desde `/completar-perfil` mandar un teléfono en E.164. Esperado: `204`, se crea el `Cliente`, el `Usuario` queda con `ClienteId`, y la siguiente navegación entra a `/panel` sin volver a pedir nada. Probar también un teléfono sin código de país: lo rechaza el formulario.
- [ ] **Escenario 9 — Callejón (Foco 5):** con una cuenta de Google de perfil incompleto, crear a mano una ficha de `Cliente` con ese mismo correo. Luego mandar el formulario. Esperado: `409` con el mensaje del taller, y el botón de cerrar sesión visible y funcional.
- [ ] **Escenario 10 — Ficha del taller sin cuenta:** entrar con Google con el cuarto correo. Esperado: `409`, `/login?error=taller`, y ninguna cuenta creada.
- [ ] **Escenario 11 — Gate y guarda:** sin cookie de sesión, abrir `/panel` → `/login`. Con sesión de perfil incompleto, abrir `/panel` → `/completar-perfil`.
- [ ] **Escenario 12 — `Activo = false` mata un token vivo:** iniciar sesión, poner `Activo = false` en esa cuenta y reusar el token. Esperado: `401`. Es la **única** palanca de invalidación que la decisión 7 deja para las cuentas de Google, así que tiene que comprobarse explícitamente. Ojo con el reverso: reactivar dentro de la vida del token (≤60 min) lo revive, porque `Activo` no rota `VersionCredenciales`.
- [ ] **Escenario 13 — Cambiar contraseña sigue cerrando sesiones:** con una cuenta de contraseña, iniciar sesión, cambiar la contraseña, y reusar el token viejo. Esperado: `401`.

- [ ] **Punto de commit final**

Resumirle a Rodrigo el resultado de los trece escenarios, y recordarle que el client ID de Google tiene que quedar configurado en el despliegue de la API, no solo en Vercel.

---

## Orden de despliegue (obligatorio)

La API **no aplica migraciones al arrancar** (no hay `Migrate()` en `Program.cs`) y el workflow de GitHub solo publica. Por eso el orden no es opcional:

1. Aplicar la migración a la base de producción.
2. Recién después desplegar el código.

Si el código llega primero, `ConfiguracionSeguridad` y `AuthService` consultan `VersionCredenciales`, una columna que todavía no existe, y el resultado no es el "cierre de sesión masivo de una sola vez" de la decisión 3 sino **500 en el login y en toda petición autenticada**.

Y `Google:ClientId` tiene que estar configurado del lado de la API antes de desplegar, no solo en Vercel, o la API no arranca (decisión 4).

## Notas sobre cosas ajenas a este cambio

- **El límite de intentos de `/api/auth/registro` no funciona como parece.** La política `"registro"` en `Program.cs` reparte por `contexto.Connection.RemoteIpAddress`, pero `apiFetch` es server only y las llamadas llegan desde el servidor de Vercel sin `X-Forwarded-For`. No son 5 intentos por persona cada 10 minutos: es un único balde global de 5 para todos los usuarios juntos. Bug preexistente, fuera del alcance, vale arreglarlo aparte.
- **`/api/auth/login` no tiene límite de intentos alguno.** También preexistente.
- **`/api/auth/registro` permite enumerar cuentas:** devuelve mensajes distintos para "ya existe una cuenta", "ya está registrado en el taller" y el alta exitosa. Eso revela si un correo está en el sistema, lo que anula en la práctica el login de tiempo constante que `AuthService` se esfuerza en mantener. Preexistente y fuera del alcance, pero conviene decidirlo.
- **Reactivar una cuenta resucita sus tokens no expirados** (≤60 min), porque `CambiarEstadoAsync` no rota `VersionCredenciales`. Debilita la decisión 7, que deja `Activo = false` como única palanca para cuentas de Google. Un `SetProperty` de `VersionCredenciales` en ese servicio lo cerraría.
