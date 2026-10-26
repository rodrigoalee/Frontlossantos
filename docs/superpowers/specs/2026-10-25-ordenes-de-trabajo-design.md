# Módulo de Órdenes de trabajo — diseño

Fecha: 25/10/2026 · Repos: `Frontlossantos` (Next.js) y `CustomCore.API` (.NET 8)

## Para qué

Hoy el taller agenda y confirma citas, pero lo que pasa cuando el carro llega no queda en el sistema. Este módulo cubre ese tramo:

1. **El recepcionista** recibe el carro, abre la orden desde la cita, anota lo que reporta el cliente y se la asigna a un mecánico, viendo quién está disponible.
2. **El mecánico** entra con su cuenta, ve **sus** órdenes, empieza una, escribe el diagnóstico, agrega los repuestos que usa y los servicios extra que encuentre, y la finaliza.
3. **El cliente** ya ve el avance en `/panel/citas/[id]` (el seguimiento ya lee el estado de la orden); con este módulo ese seguimiento por fin tiene datos reales.

Es la base de lo que sigue: facturación y cobro salen de una orden finalizada.

## Decisiones del usuario

- El mecánico **entra al sistema con su propia cuenta** y ve solo las órdenes que tiene asignadas.
- **Toda orden nace de una cita.** Si el carro llega sin cita, el recepcionista primero la registra en el módulo de Citas y desde ahí abre la orden.
- **El servicio viene de la cita** y entra solo como primera línea de la orden.
- **El mecánico registra los repuestos** y también **agrega servicios extra** que descubra, sin pasar por recepción.
- **"Disponible" se calcula por órdenes:** disponible = sin órdenes *En recepción* ni *En proceso* asignadas; ocupado = tiene al menos una (se muestra cuántas). Es informativo: se puede asignar a un mecánico ocupado.
- Aprobó los bocetos (`.superpowers/brainstorm/.../ordenes-pantallas.html`) como punto de partida: "hazlos y luego vamos depurando".

## Fuera de alcance

- Facturación, cobro y pago de la orden (siguiente módulo).
- Reabrir una orden finalizada desde la UI (el backend lo permite; no se expone ahora).
- Marcar disponibilidad a mano (almuerzo, ausencia).
- Aviso por WhatsApp de "tu vehículo está listo" (se puede sumar después con el servicio que ya existe).
- Órdenes viejas sin cita: siguen existiendo y se muestran, pero no se pueden crear nuevas sin cita.

## Lo que ya existe en el backend (no se rehace)

`OrdenesTrabajoController` (`/api/ordenes`): listado paginado con filtros (estado, búsqueda por placa/cliente, fechas, sede), detalle con líneas, crear (valida cita: mismo carro y sede, no cancelada, sin otra orden; confirma la cita si estaba *Pendiente*), editar mecánico+diagnóstico, cambiar estado (sella `FechaFinalizacion` al finalizar), agregar/quitar líneas (descuenta/devuelve stock de la sede de la orden, recalcula total, bloquea si está finalizada o facturada). Precios salen del catálogo. Todo con auditoría y bloqueo de fila.

## Cambios en el backend

### 1. Permiso y rol de mecánico
- Nuevo permiso **`ordenes.trabajar`** ("Puede recibir órdenes asignadas"). Identifica a los mecánicos: solo usuarios con este permiso aparecen para asignar y se aceptan como `MecanicoAsignadoId`.
- Migración con SQL idempotente (mismo estilo que `InventarioPorSucursal`): inserta el permiso y crea el rol **`Mecánico`** si no existe, con `ordenes.leer`, `ordenes.editar`, `ordenes.cambiar_estado`, `ordenes.trabajar`, `servicios.leer`, `inventario.leer`. Registrar la política en `ConfiguracionSeguridad` como las demás.
- **Alcance del mecánico (decisión mía):** quien tiene `ordenes.trabajar` y **no** tiene `ordenes.crear` solo ve y modifica órdenes asignadas a él (listado, detalle, editar, estado, líneas). Para los demás, 404 como cualquier orden fuera de alcance. Así el Gerente/recepcionista sigue viendo todo su tablero.
- `ValidarMecanicoAsync` además exige que el usuario tenga `ordenes.trabajar`.

### 2. Mecánicos con disponibilidad
- `GET /api/ordenes/mecanicos?sucursalId=` (política `ordenes.crear`): mecánicos activos de la sede con `ordenes.trabajar` y su número de órdenes activas (*En recepción* + *En proceso*). Ordenados: disponibles primero, luego por menos órdenes, luego por nombre. DTO: `{ idUsuario, nombreCompleto, ordenesActivas }`.

### 3. "Mis órdenes"
- `ConsultaOrdenes` gana `AsignadasAMi` (bool). Para el mecánico del punto 1 el filtro se aplica siempre, aunque no lo pida.
- `OrdenListaDto` gana `MecanicoAsignado` (nombre, nullable) para la columna del tablero.

### 4. Crear orden: cita obligatoria, motivo y servicio automático
- `CrearOrdenRequest.CitaId` pasa a **obligatorio**.
- Nueva columna **`MotivoIngreso`** (texto, máx. 1000, nullable) en `OrdenTrabajoEncabezado`: lo que reporta el cliente al dejar el carro, escrito por recepción. `Diagnostico` queda para el mecánico. Ambos se devuelven en `OrdenDetalleDto`, junto con `CitaId`.
- Si la cita tiene `ServicioId`, la orden se crea con esa línea (cantidad 1, precio del catálogo), aunque el request no traiga líneas.
- `VehiculoId` y `SucursalId` se toman de la cita (el request puede omitirlos; si vienen y no cuadran, 409 como hoy).

### 5. Diagnóstico sin tocar la asignación
- `PATCH /api/ordenes/{id}/diagnostico` (política `ordenes.editar`) con `{ diagnostico }`. Hoy el `PUT` exige mandar mecánico y diagnóstico juntos; el mecánico no debe poder reasignarse. El `PUT` queda para recepción (requiere además `ordenes.crear` para cambiar el mecánico — decisión mía).

### 6. Citas sin orden
- `ConsultaCitas` gana `SinOrden` (bool) y `CitaListaDto` gana `Servicio` (nombre, nullable) e `IdOrden` (nullable). Con `Desde/Hasta` de hoy, `Estado != Cancelada` y `SinOrden=true` el tablero arma "Citas de hoy sin orden".

> Migración nueva: se aplica a mano en Supabase antes del merge (no se corre sola).

## Cambios en el frontend

Sigue el patrón de `features/citas` y `features/clientes`: `features/ordenes/{dal.ts, actions.ts, types.ts, formato.ts, components/}`, páginas como Server Components con `Suspense` y skeletons, migas de pan y estilos daisyUI/Tailwind existentes. `apiFetch` + `ApiError`, `refresh()` tras acciones, `redirect("/login")` en 401, mensajes del `detail` en 409.

### Rutas
- **`/admin/ordenes`**
  - Con `ordenes.crear` → **tablero de recepción**: bloque "Citas de hoy sin orden" (hora, placa, vehículo, cliente, servicio, botón *Abrir orden*), y tabla/tarjetas de órdenes con filtro por estado (Todas / En recepción / En proceso / Finalizadas, en la URL como en citas), búsqueda por placa o cliente, columnas #, placa, cliente, mecánico, estado, ingreso, total.
  - Solo `ordenes.trabajar` → **Mis órdenes**: tres grupos *Por empezar* (En recepción), *En proceso*, *Terminadas hoy*. Botón *Empezar* en las por empezar.
- **`/admin/ordenes/nueva?cita={id}`** (requiere `ordenes.crear`): datos de la cita (vehículo, cliente, teléfono, servicio), textarea *Lo que reporta el cliente*, lista de mecánicos con *Disponible* / *Ocupado · N órdenes activas*, botón *Abrir orden* → redirige al detalle.
- **`/admin/ordenes/[id]`**: encabezado (placa, vehículo, cliente, estado, ingreso/salida, recibió, mecánico), motivo de ingreso, diagnóstico editable, líneas con subtotal y total, y acciones según permisos y estado:
  - *Empezar* (En recepción → En proceso) y *Finalizar* (En proceso → Finalizado, con confirmación) con `ordenes.cambiar_estado`.
  - *+ Repuesto* (inventario de la sede de la orden, muestra existencias, cantidad) y *+ Servicio* (catálogo), y quitar línea, con `ordenes.editar`, solo si no está finalizada.
  - *Cambiar mecánico* solo con `ordenes.crear`.
- **Detalle de cita (`/admin/citas/[id]`)**: botón *Abrir orden* si no tiene orden y no está cancelada; *Ver orden* si ya la tiene.
- `modulos.ts`: el módulo "Órdenes de trabajo" ya existe con `ordenes.leer`; el mecánico lo verá en su panel con solo darle el rol.

### Detalles de UI
- Estados con etiqueta en español y color consistente: En recepción, En proceso, Finalizado.
- Montos en quetzales con el formato que ya usa el proyecto.
- Errores de stock insuficiente (409) se muestran tal cual vienen del backend.
- Fechas en hora de Guatemala, como en citas.

## Qué queda a criterio de quien construya
Nombres internos de componentes y funciones, el layout fino (tabla vs. tarjetas en móvil, siguiendo lo que hace citas), los textos de confirmación y los skeletons.

## Cómo se prueba
- Backend: crear rol Mecánico y un usuario con él; recepción abre orden desde cita → la cita queda Confirmada, la orden trae la línea del servicio y el motivo; el mecánico ve solo sus órdenes, empieza, agrega repuesto (baja el stock), servicio, escribe diagnóstico y finaliza; otro mecánico recibe 404 sobre esa orden; abrir orden sin cita → 400.
- Frontend: recorrer los tres flujos de los bocetos con el usuario recepcionista y el mecánico, y ver el seguimiento del cliente avanzar en `/panel/citas/[id]`.
