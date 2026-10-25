# Agendar cita y Mi perfil — diseño

Fecha: 23/10/2026 · Repos: `Frontlossantos` (Next.js 16 + daisyUI) y `CustomCore.API` (.NET 8 + EF Core + Postgres/Supabase)

## Intención

El cliente del portal debe poder agendar su visita al taller solo, viendo qué horarios quedan libres en la sede que elija, sin llamar al taller. Para eso primero necesita tener sus vehículos registrados, lo que hace desde una página "Mi perfil".

## Metas

1. **Mi perfil** (`/panel/perfil`): datos del cliente (nombre, correo, teléfono) y sección "Mis vehículos" con la lista y un formulario para registrar uno nuevo (marca, modelo, año, placa).
2. **Menú Opciones**: deja de desplegar nombre/correo/teléfono. Muestra la opción **"Mi perfil"** (lleva a `/panel/perfil`) y **"Cerrar sesión"**, con el estilo del mockup *tools de opciones* (panel oscuro, borde gris, íconos en círculo naranja).
3. **Agendar cita** (`/panel/citas/nueva`) por pasos: **1. Datos de la cita → 2. Confirmación**.
   - Paso 1: select de **vehículo** (solo los del cliente), select de **sede**, select de **servicio**, y **calendario + horarios**.
   - Paso 2: resumen de lo elegido y botón para confirmar; al confirmar se crea la cita y se vuelve a "Mis citas".
4. **Disponibilidad visible**: el calendario marca los días sin ningún horario libre; al elegir un día se ven sus horarios, con los ocupados deshabilitados.
5. **La cita queda ligada al servicio** del catálogo (`ServicioId`), y "Mis citas" usa el nombre del servicio como título.

## No-metas

- Pago o anticipo (el paso "Pago" del mockup se quita).
- Editar o eliminar vehículos desde el portal.
- Editar datos personales desde Mi perfil (solo lectura).
- Reprogramar o cancelar citas desde el portal.
- Feriados o cierres especiales.
- La vista de seguimiento (`/panel/citas/[id]`) — viene después.

## Anti-metas (sería un fracaso aunque "funcione")

- Que el cliente pueda reservar un horario que ya tiene 3 carros, aunque sea por dos reservas simultáneas.
- Que un cliente vea u opere vehículos, citas o datos de otro cliente.
- Que registrar una placa ya existente de otro cliente se la "pase" a quien la registró.

## Reglas de negocio (decididas por el usuario)

- **Capacidad: 3 carros a la vez por sede.**
- **Duración de cada cita: 1 hora.**
- La **sede la elige el cliente** en un select.
- El **vehículo** se escoge en un select entre los registrados en Mi perfil.
- El **servicio** se escoge en un select del catálogo; se guarda como `ServicioId` en la cita (con migración).

## Backend (CustomCore.API)

Todos los endpoints nuevos van en `PortalController` (`api/portal`, solo `[Authorize]`), y el alcance sale del `ClienteId` del usuario de la sesión (patrón ya existente en `PortalService`). Una cuenta sin `ClienteId` recibe 403.

### Migración
- `Cita.ServicioId` (`int?`, FK a `Servicios`, `OnDelete Restrict`) + navegación `Servicio?`.
- Nullable porque las citas existentes no tienen servicio y el flujo del taller (`POST /api/citas`) no lo exige.
- Se aplica a mano en Supabase antes del merge (no hay nada que la corra solo).

### Endpoints
| Método y ruta | Qué hace |
|---|---|
| `GET /api/portal/perfil` | Ya existe: nombre, correo, teléfono. |
| `GET /api/portal/vehiculos` | Vehículos del cliente (id, marca, modelo, año, placa). |
| `POST /api/portal/vehiculos` | Registra un vehículo para el cliente de la sesión. Placa normalizada (trim + mayúsculas). Si la placa ya existe → 409 con mensaje "Esa placa ya está registrada en el taller. Comunícate con nosotros." (no se revela de quién es). |
| `GET /api/portal/sucursales` | Sedes activas (id, nombre, dirección). |
| `GET /api/portal/servicios` | Servicios activos (id, nombre, tarifa de mano de obra). |
| `GET /api/portal/disponibilidad?sucursalId&desde&hasta` | Por cada día del rango (fechas locales `yyyy-MM-dd`, máx. 62 días): lista de horarios con `fechaHora` (ISO con offset) y `disponible`. |
| `POST /api/portal/citas` | Crea la cita: `{ vehiculoId, sucursalId, servicioId, fechaHora }`. Estado `Pendiente`, duración 60, `Motivo` nulo. Devuelve 201 con el id. |
| `GET /api/portal/citas` | Ya existe; se agrega el nombre del servicio al DTO. |

### Horario y disponibilidad
- Zona del taller: **America/Guatemala** (UTC−6, sin horario de verano). Constante en el backend.
- Horario: **lunes a viernes 8:00–18:00, sábados 8:00–13:00, domingo cerrado**. Bloques de 1 hora que empiezan en punto; el último bloque termina a la hora de cierre (L–V: 8:00 … 17:00; sábado: 8:00 … 12:00).
- Ventana de reserva: desde la siguiente hora en punto a partir de ahora hasta **60 días** adelante. Horarios pasados → no disponibles.
- Un bloque está ocupado si hay **3 o más citas no canceladas** de esa sede cuyo intervalo `[FechaHora, FechaHora + DuracionMinutos)` se cruza con el bloque. Así cuentan también las citas que el taller registró con otras horas o duraciones.
- Estas reglas viven **solo en el backend**; el front pinta lo que devuelve `disponibilidad`.

### Validaciones de `POST /api/portal/citas`
1. Vehículo existe y es del cliente de la sesión (si no → 404, sin distinguir).
2. Sede activa; servicio activo.
3. `fechaHora` es un inicio de bloque válido del horario y dentro de la ventana.
4. El vehículo no tiene otra cita no cancelada que se cruce (regla ya existente en `CitaService`).
5. Capacidad < 3 en ese bloque.
- **Concurrencia**: los pasos 4–5 y el insert corren en una transacción que primero **bloquea la fila de la sucursal** (`SELECT … FOR UPDATE`, con el helper `BloquearFilaAsync<Sucursal>` dentro de `EjecutarUnidadAuditadaAsync`, que ya existen). Dos reservas simultáneas a la misma sede se serializan, y la segunda ve la primera.
- Errores de regla → `ConflictoNegocioException` (409) con un mensaje que el front muestra tal cual.

## Frontend (Frontlossantos)

### Librería de calendario
- **`react-day-picker`** (versión vigente): es un componente React, se estiliza con clases de Tailwind/daisyUI y soporta `modifiers` para marcar días (punto bajo el número en días llenos, como el ejemplo *JS-Calendar*) y `disabled` para domingos/pasado/fuera de ventana.
- Debajo del calendario, los horarios del día elegido van como una rejilla de botones; los ocupados aparecen deshabilitados y tachados o atenuados.

### Estructura
- `src/app/panel/perfil/page.tsx` — Mi perfil.
- `src/app/panel/citas/nueva/page.tsx` — Agendar cita.
- `src/features/vehiculos/` — dal, server action de registro, formulario y lista.
- `src/features/citas/` — se amplía: dal (sucursales, servicios, disponibilidad, crear), server action `agendarCita`, componente cliente del wizard.
- La disponibilidad la pide el componente cliente al cambiar sede o mes; se expone con una server action (`obtenerDisponibilidad(sucursalId, desde, hasta)`), para que el JWT nunca salga de la cookie httpOnly.
- Si el cliente no tiene vehículos, el paso 1 muestra un aviso con enlace a Mi perfil en lugar del select.
- El paso 2 muestra: vehículo, sede, servicio (con "precio estimado de mano de obra: Q…"), fecha y hora. "Volver" regresa al paso 1 sin perder lo elegido.
- Tras crear: redirect a `/panel`. Si el horario se llenó entre medio (409), se vuelve al paso 1 con el mensaje y se refresca la disponibilidad.

### Estilo
- El mismo del panel actual: tarjetas `rounded-3xl` con borde, acentos naranja (`primary`) y café (`secondary`), botones `rounded-full`.
- Stepper de 2 pasos como en el mockup, en colores de la marca.

## Lo que se deja al implementador
- Nombres exactos de DTOs, componentes y archivos dentro de la estructura de arriba.
- Diseño fino del esqueleto de carga y de los estados vacíos.
- Formato visual del precio (moneda GTQ, `Intl.NumberFormat("es-GT")`).

## Convenciones
- API: comentarios solo con formato `//[INICIO][dd/m/aaaa][Rodriale][motivo]` … `//[FIN]…`.
- Front: sin comentarios nuevos.
- Sin commits: el usuario commitea su trabajo.
- Next.js 16 con `cacheComponents`: lo que lee la sesión va detrás de `<Suspense>` o en segmentos con `instant = false`; revisar `node_modules/next/dist/docs/` antes de usar APIs nuevas.
