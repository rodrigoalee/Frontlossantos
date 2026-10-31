# Cita con varios servicios y cotización previa — diseño

Fecha: 27/10/2026 · Repos: `Frontlossantos` (Next.js 16 + daisyUI) y `CustomCore.API` (.NET 8 + EF Core + Postgres/Supabase, esquema `customcore`)

## Intención

El cliente no siempre llega por un servicio del catálogo. A veces quiere "cambio de aceite **y** que revisen un ruido en los frenos", y a veces solo lo segundo. Hoy el portal obliga a elegir exactamente un servicio (`PortalService.AgendarCitaAsync`), guarda `Motivo = null` y no hay forma de decir qué más quiere que se revise.

Además, el flujo de la cotización está desordenado: solo se puede cotizar con la orden abierta, o sea el día de la cita. El usuario quiere que lo que está fuera del catálogo se cotice **antes** de confirmar la cita, y que la cita se confirme cuando el cliente acepta.

## Flujo (decidido por el usuario, en este orden)

1. **El cliente agenda** en el portal: elige **cero o más** servicios del catálogo y, si quiere, escribe qué más necesita que revisen. Tiene que poner al menos una de las dos cosas. El horario queda apartado desde ese momento (la cita nace `Pendiente`, como hoy).
2. **La cita sigue uno de dos caminos:**
   - **Solo servicios del catálogo:** el precio ya se conoce. **No hay cotización**: la recepción la confirma como hoy.
   - **Con texto del cliente:** se hace una **cotización antes de confirmar**. La recepción la arma desde el detalle de la cita, se avisa por WhatsApp y el cliente responde en el portal.
     - **Acepta** → la cita se **confirma sola**.
     - **Rechaza** → la cita **se mantiene solo con los servicios del catálogo** y se confirma sola.
3. **El día de la cita**, al abrir la orden entran solos como líneas todos los servicios de la cita y las líneas de sus cotizaciones aceptadas (como "Adicional").
4. **Durante el trabajo**, si el mecánico encuentra algo más, se cotiza como hoy. Al aceptarla, las líneas entran directo a la orden abierta.

## Metas

1. Una cita puede tener **varios servicios del catálogo** (tabla `CitaServicio`).
2. El cliente puede escribir **qué quiere que revisen** (`Cita.Motivo`).
3. La **cotización cuelga de la cita**, no de la orden. Así un solo módulo sirve para los pasos 2 y 4.
4. Aceptar o rechazar una cotización previa **confirma la cita automáticamente** y manda el aviso de cita confirmada que ya existe (`NotificacionWhatsAppService.CitaConfirmadaAsync`).
5. En el admin se distingue **"Por cotizar"** y **"Esperando respuesta"** de **"Por confirmar"**, para que la recepción sepa qué hacer con cada cita pendiente.

## No-metas

- Que el cliente cambie sus servicios o su texto después de agendar.
- Duración distinta según el servicio: la cita sigue usando el bloque fijo de `HorarioTaller`.
- Que una cotización sin respuesta expire o se cancele sola.
- Aprobar la plantilla de WhatsApp en Meta (sigue pendiente aparte, ver Riesgos).
- Cotizar repuestos o servicios del catálogo: la cotización sigue siendo de líneas libres (concepto, cantidad, precio).

## Anti-metas (sería un fracaso aunque "funcione")

- Que una línea aceptada **no llegue** a la orden, o que llegue **dos veces**.
- Que un cliente vea o responda la cotización de la cita de otro cliente.
- Que se pueda crear una cita sin servicios y sin texto.
- Que se pierda el servicio de las citas que ya existen al migrar.

## Reglas de negocio

### Estados que ve el admin (derivados, sin columna nueva)
`EstadoCita` no cambia (`Pendiente`, `Confirmada`, `Cancelada`). La etiqueta de una cita `Pendiente` se calcula así:

| Condición | Etiqueta |
|---|---|
| Tiene una cotización `Pendiente` | **Esperando respuesta** |
| Tiene texto (`Motivo`) y ninguna cotización | **Por cotizar** |
| Lo demás | **Por confirmar** (como hoy) |

La API devuelve la etiqueta ya calculada (o los datos necesarios, a criterio del implementador) en el listado y en el detalle de citas.

### Responder una cotización previa
Una cotización es "previa" si su cita todavía no tiene orden.
- **Aceptar** → la cotización queda `Aceptada` y sus líneas esperan en la cotización. Si la cita está `Pendiente`, pasa a `Confirmada` y se manda el aviso.
- **Rechazar** → la cotización queda `Rechazada`. Si la cita está `Pendiente` y no le quedan cotizaciones `Pendiente`:
  - si tiene servicios del catálogo → pasa a `Confirmada` y se manda el aviso;
  - si **no** tiene servicios → pasa a `Cancelada` y se libera el horario. *(Decisión de Claude: no queda nada que hacer en esa cita.)* No se manda WhatsApp, porque el que rechazó fue el propio cliente y no existe un aviso de cancelación. En Mis citas y en el seguimiento queda como cancelada, junto a la cotización rechazada. *(Decisión de Claude.)*
- No se puede responder la cotización de una cita **cancelada**: responde 409 con mensaje. *(Decisión de Claude.)*
- Si la cita ya tiene orden abierta, aceptar funciona como hoy: las líneas entran a la orden en la misma transacción. Si la orden ya está cerrada o facturada, se mantiene el error actual.

### Al abrir la orden (`OrdenTrabajoService`, creación desde cita)
- Entran como líneas **todos** los servicios de la cita que sigan activos y no vengan ya en el request. Es la regla actual (`OrdenTrabajoService.cs:193-202`) aplicada a varios.
- Entran como líneas "Adicional" las líneas de **todas las cotizaciones `Aceptada`** de la cita. No hay riesgo de duplicar: antes de que exista la orden, ninguna cotización pudo haber escrito líneas en ella.

### Otras reglas
- La recepción **puede seguir confirmando a mano** una cita "Por cotizar" o "Esperando respuesta" (por ejemplo, si lo arregló por teléfono). La cotización sigue abierta, y si después se acepta solo deja sus líneas para la orden. *(Decisión de Claude.)*
- Se puede crear una cotización en cualquier cita no cancelada, tenga texto o no. *(Decisión de Claude: una sola regla para los pasos 2 y 4.)*
- **Citas del mostrador** (`POST /api/citas`, la crea el taller con el cliente enfrente): también permiten varios servicios y texto, con la misma regla de "al menos uno", pero **siguen naciendo `Confirmada`** sin cotización previa. Lo de fuera del catálogo se cotiza en el paso 4. *(Decisión de Claude: el cliente está presente y se le puede dar el precio ahí.)*
- Una cita no puede tener el mismo servicio dos veces.
- **Reprogramar ya no toca `Motivo`**: es el texto del cliente y es lo que decide la etiqueta "Por cotizar". Se quita del request de reprogramar y de su formulario en el front. *(Decisión de Claude.)*
- `CambiarEstadoAsync` (confirmar o cancelar a mano) bloquea la fila de la cita igual que `ResponderAsync`, para que una respuesta del cliente y un cambio manual no se pisen. *(Decisión de Claude.)*

## Backend (CustomCore.API)

### Migraciones (dos: `CitaConVariosServicios` con los pasos 1–3 y `CotizacionPorCita` con los pasos 4–5; se aplican a mano en Supabase como las anteriores)
1. Crear `CitaServicio (CitaId, ServicioId)` con PK compuesta, FK a `Citas` con borrado en cascada y FK a `Servicios` con `Restrict`.
2. Copiar `INSERT … SELECT IdCita, ServicioId FROM Citas WHERE ServicioId IS NOT NULL`.
3. Borrar la columna `Citas.ServicioId` y su FK e índice.
4. `Cotizaciones`: agregar `CitaId`, llenarlo con `OrdenesTrabajoEncabezado.CitaId` de su orden, hacerlo `NOT NULL` con FK a `Citas`, y borrar `OrdenTrabajoId`. **Antes de aplicarla**, revisar que ninguna cotización cuelgue de una orden sin cita (`OrdenTrabajoEncabezado.CitaId` es nullable); si hay, la migración falla en vez de inventar datos.
5. Índice en `Cotizaciones.CitaId`.

La regla de "al menos un servicio o texto" se valida en el servicio, porque no se puede expresar como `CHECK` entre dos tablas.

### Entidades y DTOs
- `Cita`: se quita `ServicioId`/`Servicio` y se agrega `ICollection<CitaServicio> Servicios`. `Motivo` se mantiene (largo máximo según la columna actual; si no tiene, 500).
- `Cotizacion`: `OrdenTrabajoId` → `CitaId`, con navegación a `Cita`.
- `AgendarCitaRequest` (portal) y `CrearCitaRequest` (mostrador): `ServicioId` → `ServicioIds: int[]` (puede venir vacío) más `Motivo`.
- Los DTOs que hoy traen `servicio: string?` (lista y detalle de citas, citas del portal, seguimiento, listado de órdenes) pasan a `servicios: string[]`.

### Servicios que cambian
- `PortalService.AgendarCitaAsync`: valida que los servicios existan, estén activos y no se repitan, y la regla de "al menos uno". Guarda el `Motivo` recortado (vacío → `null`).
- `CitaService`: `CrearAsync` igual que arriba. `ObtenerAsync`/`ObtenerPorIdAsync` devuelven la lista de servicios y la etiqueta derivada.
- `OrdenTrabajoService`: al crear desde cita aplica las reglas de "Al abrir la orden". Los listados devuelven la lista de servicios.
- `CotizacionService`:
  - el alcance se calcula a partir de la cita: sede de la cita y, para el mecánico restringido, solo citas cuya orden tenga asignada;
  - `CrearAsync` recibe la cita: exige que no esté cancelada y, si ya tiene orden, que esa orden siga abierta para editar líneas (`EstaAbiertaParaEditarLineasAsync`, como hoy);
  - `ResponderAsync` implementa "Responder una cotización previa". El bloqueo se hace sobre la fila de la **cita** (`BloquearFilaAsync<Cita>`) y, si hay orden, también sobre la orden.
- `NotificacionWhatsAppService`: el texto "para {servicio}" junta los nombres ("para Cambio de aceite y Alineación"). Si la cita no tiene servicios, se omite, como hoy. `CotizacionEnviadaAsync` recibe la cita en vez de la orden.

### Endpoints
- Las cotizaciones se crean y se listan **por cita**: `POST/GET /api/citas/{id}/cotizaciones`. **Crear** pide `ordenes.cotizar`, como hoy. **Listar** pide `ordenes.leer`, el mismo permiso que el listado actual por orden, para que el Operario y el Cajero las sigan viendo en la orden. *(Decisión de Claude.)* La ruta actual por orden se elimina y el detalle de la orden usa el `citaId` de su orden.
- Portal: `GET /api/portal/citas/{id}/cotizaciones` y la respuesta del cliente se mantienen. Solo cambia por dentro la forma de filtrar (por `Cita.Vehiculo.ClienteId`).

## Frontend (Frontlossantos)

- **Agendar (portal)** `AgendarCitaWizard`: el select de servicio se cambia por una **lista de casillas** de servicios activos con su tarifa, más un cuadro **"¿Qué más quieres que revisemos?"**. Los dos son opcionales, pero hay que poner al menos uno. En el paso 2 se muestran los servicios con su estimado sumado y, si hay texto, el aviso *"Te enviaremos una cotización de esto antes de confirmar tu cita."*. Se ajusta el texto de `panel/citas/nueva/page.tsx` ("Elige tu vehículo, la sede, el servicio…").
- **Mis citas** `CitaCard` y **seguimiento** `SeguimientoCita`: el título junta los servicios; si no hay, se usa el texto del cliente (como hoy). Cuando hay una cotización por responder, se ve antes de que exista la orden y la tarjeta lo indica.
- **Admin, citas** (`HotCitas`, `DetalleCitaTaller`): columna de servicios unidos y la etiqueta derivada (Por confirmar / Por cotizar / Esperando respuesta). En el detalle, el texto del cliente bien a la vista y la sección de cotizaciones (`CotizacionesOrden` y `NuevaCotizacionForm`, reutilizados por cita).
- **Mostrador** `NuevaCitaTallerWizard` y `mostrador/actions.ts`: casillas de servicios más texto, con "al menos uno" en lugar de "servicio obligatorio".
- **Abrir orden** `AbrirOrden`: lista los servicios y el texto del cliente. La nota cambia a *"Los servicios de la cita y las cotizaciones aceptadas entran solos como líneas de la orden."*.
- **Detalle de orden**: las cotizaciones se piden por el `citaId` de la orden.
- `OrdenCard` y `TableroOrdenes`: muestran los servicios unidos.

## Riesgos

- **WhatsApp fuera de las 24 h:** Meta solo deja mandar texto libre dentro de las 24 h desde el último mensaje del cliente. En la cotización previa el cliente agendó por el portal y casi nunca habrá escrito por WhatsApp, así que el aviso probablemente no llegue hasta tener la plantilla aprobada. Por eso el portal (Mis citas y seguimiento) tiene que mostrar la cotización pendiente por su cuenta, sin depender del WhatsApp.
- **Diagnóstico:** "un ruido en los frenos" muchas veces no se puede cotizar sin ver el carro. En la práctica la cotización previa puede ser "Revisión de frenos, Q150", y la reparación real se cotiza en el paso 4. El flujo lo permite sin cambios.

## Lo que se deja al implementador
- Nombres exactos de DTOs, componentes y métodos dentro de la estructura de arriba.
- Si la etiqueta derivada se calcula en la API o se arma en el front a partir de los datos que devuelve la API.
- Cómo se ven las casillas de servicios y los estados vacíos.
- Mensajes de error exactos (en español, mostrados tal cual por el front).

## Convenciones
- API: comentarios solo con el formato `//[INICIO][dd/m/aaaa][Rodriale][motivo]` … `//[FIN]…`.
- Front: sin comentarios nuevos.
- Sin commits: el usuario commitea su trabajo.
- Código simple, sin sobreingeniería. No guardar lo que se puede derivar (por eso no hay estado nuevo en la cita).
- Next.js 16 con `cacheComponents`: revisar `node_modules/next/dist/docs/` antes de usar APIs nuevas.
