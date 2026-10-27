# Cita con varios servicios y cotización previa — Plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usar superpowers:subagent-driven-development (recomendada) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** que la cita tenga cero o más servicios del catálogo más el texto del cliente, y que lo de fuera del catálogo se cotice sobre la cita antes de confirmarla. La respuesta del cliente confirma (o cancela) la cita sola.

**Arquitectura:** la tabla `CitaServicio` reemplaza a `Cita.ServicioId`, y `Cotizacion.CitaId` reemplaza a `OrdenTrabajoId`. Las reglas viven en `CotizacionService.ResponderAsync` (confirmar o cancelar la cita) y en `OrdenTrabajoService` al crear la orden desde la cita (servicios y cotizaciones aceptadas como líneas). La etapa de una cita pendiente se calcula en la consulta, sin columna nueva. El front cambia el select por casillas y reutiliza los componentes de cotizaciones por cita.

**Stack:** .NET 8 + EF Core 8 (Npgsql, esquema `customcore`); Next.js 16 (`cacheComponents`), React 19, Tailwind 4 + daisyUI 5.

**Spec:** `docs/superpowers/specs/2026-10-27-cita-con-servicios-y-cotizacion-previa-design.md` (en el repo del front)

## Restricciones globales

- API: `C:\Users\roood\source\repos\CustomCore.API\CustomCore.API` (rama `Local/FeatureSucursales`). Front: `C:\Users\roood\OneDrive\Escritorio\Carpetas\Octavo Semestre\Desarrollo Web\Frontlossantos` (rama `Local/FeatureAutenticacion`).
- **Rodrigo hace todos los commits.** Ninguna tarea ejecuta `git commit` ni `push`. Al cierre de cada tarea: resumir qué cambió y seguir.
- Las migraciones se aplican solo a una base cuyo host sea `localhost` (verificar sin imprimir la cadena). Supabase lo aplica Rodrigo a mano.
- No hay pruebas automatizadas en ningún repo. Verificación: API → `dotnet build --nologo -v q -o "$TEMP/cc-api-check"` con 0 errores. Front → `npx tsc --noEmit`, `npx eslint src`, `npx next build`. Escenarios con `curl` contra `http://localhost:5239` (token de cliente en `$TOKEN`, de recepción en `$TOKEN_REC`) o en el navegador.
- Comentarios en la API solo con `//[INICIO][27/10/2026][Rodriale][motivo]` … `//[FIN][27/10/2026][Rodriale][motivo]`. En el front, sin comentarios nuevos.
- Código simple. No guardar lo que se puede derivar.
- Mensajes exactos (409, `ConflictoNegocioException`):
  - sin servicios ni texto: `Elige al menos un servicio o cuéntanos qué necesitas que revisemos.`
  - servicio inválido: `Uno de los servicios no existe o ya no está disponible.`
  - cotizar cita cancelada: `No se puede cotizar una cita cancelada.`
  - responder sobre cita cancelada: `Esta cita ya fue cancelada.`
- Textos exactos del front:
  - cuadro de texto: **`¿Qué más quieres que revisemos?`**
  - aviso en la confirmación: **`Te enviaremos una cotización de esto antes de confirmar tu cita.`**
  - nota en abrir orden: **`Los servicios de la cita y las cotizaciones aceptadas entran solos como líneas de la orden.`**
  - etiquetas: **`Por confirmar`**, **`Por cotizar`**, **`Esperando respuesta`**.

## Foco de revisión

1. **El cliente acepta justo después de que la recepción canceló la cita:** 409 `Esta cita ya fue cancelada.`, sin confirmarla de nuevo. → Tarea 2, Paso 6 (escenario e).
2. **Cotización aceptada antes de la orden y la orden se abre con el servicio de la cita también en `request.Lineas`:** cada línea de la cotización aparece una sola vez como "Adicional" y el servicio una sola vez. → Tarea 2, Paso 6 (escenario c).
3. **`servicioIds: [3, 3]` llamando directo a la API:** se guarda una sola fila (se aplica `Distinct`), sin error. → Tarea 1, Paso 7 (escenario c).
4. **`motivo: "   "` y `servicioIds: []`:** 409 con el mensaje de "al menos uno". El texto en blanco cuenta como vacío. → Tarea 1, Paso 7 (escenario b).
5. **Citas existentes con `ServicioId`:** después de migrar siguen mostrando su servicio, y una cita vieja sin servicio no rompe ninguna pantalla (`servicios: []`). → Tarea 1, Paso 7 (escenario a).

---

## Mapa de archivos

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| API `Entidades/CitaServicio.cs` (nuevo), `Entidades/Cita.cs`, `Entidades/CitaConfiguracion.cs`, `Data/AppDbContext.cs`, `Data/Migrations/*_CitaConVariosServicios.*` | varios servicios por cita | 1 |
| API `Dtos/CitaDtos.cs`, `Dtos/PortalDtos.cs`, `Dtos/OrdenTrabajoDtos.cs` | `Servicios: IReadOnlyList<string>`, `ServicioIds`, sin `Motivo` en reprogramar | 1 |
| API `Servicios/PortalService.cs`, `Servicios/CitaService.cs`, `Servicios/OrdenTrabajoService.cs`, `Servicios/NotificacionWhatsAppService.cs` | altas, proyecciones, líneas al abrir orden, texto del aviso | 1, 2 |
| API `Entidades/Cotizacion.cs`, `Entidades/CotizacionConfiguracion.cs`, `Data/Migrations/*_CotizacionPorCita.*` | cotización cuelga de la cita | 2 |
| API `Servicios/CotizacionService.cs`, `Controllers/CotizacionesController.cs` | cotizar por cita, respuesta que confirma o cancela | 2 |
| API `Entidades/EtapaCita.cs` (nuevo), `Dtos/CitaDtos.cs`, `Dtos/PortalDtos.cs` | etapa derivada y aviso de cotización pendiente | 3 |
| Front `src/features/citas/{types,formato,actions}.ts`, `components/{AgendarCitaWizard,CitaCard,SeguimientoCita}.tsx`, `src/app/(sitio)/panel/citas/nueva/page.tsx` | agendar y ver citas en el portal | 4 |
| Front `src/features/mostrador/{types,actions}.ts`, `components/NuevaCitaTallerWizard.tsx` | mostrador | 4 |
| Front `src/features/cotizaciones/{dal,actions}.ts`, `src/features/citas/components/{HotCitas,DetalleCitaTaller}.tsx`, `src/features/ordenes/components/{AbrirOrden,DetalleOrden,OrdenCard,TableroOrdenes}.tsx`, `src/features/ordenes/types.ts`, formulario de reprogramar | admin y órdenes | 5 |

---

### Task 1: Varios servicios en la cita (API)

**Files:**
- Create: `Entidades/CitaServicio.cs`, `Data/Migrations/<ts>_CitaConVariosServicios.cs` (+ Designer y snapshot)
- Modify: `Entidades/Cita.cs`, `Entidades/CitaConfiguracion.cs`, `Data/AppDbContext.cs`, `Dtos/CitaDtos.cs`, `Dtos/PortalDtos.cs`, `Dtos/OrdenTrabajoDtos.cs`, `Servicios/PortalService.cs`, `Servicios/CitaService.cs`, `Servicios/OrdenTrabajoService.cs`, `Servicios/NotificacionWhatsAppService.cs`

**Interfaces:**
- Produces:
  - `public class CitaServicio { int CitaId; int ServicioId; Servicio Servicio = null!; }`. `Cita.Servicios : ICollection<CitaServicio>`. `Cita.ServicioId` y `Cita.Servicio` dejan de existir.
  - JSON: en `CitaListaDto`, `CitaDetalleDto`, `CitaPortalDto`, `SeguimientoCitaDto` y el DTO de listado de órdenes que hoy trae `Servicio`, el campo `string? Servicio` pasa a `IReadOnlyList<string> Servicios` (orden por nombre, nunca `null`).
  - `AgendarCitaRequest(int VehiculoId, int SucursalId, IReadOnlyList<int> ServicioIds, [MaxLength(500)] string? Motivo, DateTimeOffset FechaHora)`. `ServicioIds` es `[Required]` y admite lista vacía, con `[MaxLength(10)]`.
  - `CrearCitaRequest`: `int? ServicioId` → `IReadOnlyList<int>? ServicioIds = null` (mismo lugar, al final).
  - `ReprogramarCitaRequest(DateTimeOffset FechaHora, [Range(15, 480)] int DuracionMinutos)`, sin `Motivo`.
  - Helper privado compartido en cada servicio que valide: `Task<List<int>> ValidarServiciosAsync(IReadOnlyList<int>? ids, string? motivo, CancellationToken)`. Devuelve los ids `Distinct()`; lanza los dos mensajes de las restricciones globales. Va en una clase estática interna `ReglasCita` en `Servicios/ReglasCita.cs` (create), con firma `static Task<List<int>> ValidarServiciosAsync(AppDbContext db, IReadOnlyList<int>? ids, string? motivo, CancellationToken ct)`, para que lo usen el portal y el mostrador.

- [ ] **Step 1:** Entidad `CitaServicio` y configuración: PK `(CitaId, ServicioId)`; FK a `Cita` con `WithMany(c => c.Servicios)` y `Cascade`; FK a `Servicio` con `Restrict`; `DbSet<CitaServicio> CitasServicios`. Quitar `ServicioId`/`Servicio` de `Cita` y su configuración (`CitaConfiguracion.cs:38-40`).
- [ ] **Step 2:** `dotnet ef migrations add CitaConVariosServicios`. Editar el `Up` para que, **entre** `CreateTable` y `DropColumn`, corra `migrationBuilder.Sql(@"INSERT INTO customcore.""CitasServicios"" (""CitaId"", ""ServicioId"") SELECT ""IdCita"", ""ServicioId"" FROM customcore.""Citas"" WHERE ""ServicioId"" IS NOT NULL;")`. Revisar los nombres reales de tabla en el Designer. El `Down` hace lo inverso: agrega la columna y la llena con `MIN(ServicioId)` por cita. Verificar host `localhost` y `dotnet ef database update`.
- [ ] **Step 3:** `ReglasCita.ValidarServiciosAsync`: `motivo` recortado vacío **y** sin ids → mensaje "al menos uno". Si algún id no existe o no está `Activo` → mensaje de servicio inválido. Se usa en `PortalService.AgendarCitaAsync` (reemplaza `PortalService.cs:281-283`; guarda `Motivo = motivo?.Trim()` o `null` si queda vacío, en lugar de `Motivo = null`) y en `CitaService.CrearAsync` (reemplaza `CitaService.cs:111-113`). Las dos agregan `cita.Servicios` con los ids validados.
- [ ] **Step 4:** `CitaService.ReprogramarAsync`: quitar el `.SetProperty(c => c.Motivo, …)`. Proyecciones de lista y detalle → `c.Servicios.Select(s => s.Servicio.Nombre).OrderBy(n => n).ToList()`. Lo mismo en `PortalService.ObtenerCitasAsync` y `ObtenerSeguimientoAsync` y en el listado de órdenes (`OrdenTrabajoService.cs:44`, vía `o.Cita!.Servicios`, lista vacía si no hay cita).
- [ ] **Step 5:** `OrdenTrabajoService` al crear desde cita (`:193-202`): cargar los `ServicioId` de `CitaServicio` de la cita que sigan activos y no vengan en `request.Lineas`, y agregar una línea `new CrearLineaOrdenRequest(null, id, 1)` por cada uno, en orden de nombre, antes de las del request.
- [ ] **Step 6:** `NotificacionWhatsAppService`: `DatosAviso.Servicio` → `IReadOnlyList<string> Servicios` (las dos proyecciones). `Servicio(datos)` devuelve vacío si la lista está vacía, y si no, `" para " + Unir(servicios)`, donde `Unir` da `"A"`, `"A y B"` o `"A, B y C"`.
- [ ] **Step 7: Verificar.** Build con 0 errores. Con `curl`:
  - (a) Después de migrar, `GET /api/citas/{id}` de una cita vieja con servicio trae `servicios: ["…"]`, y una sin servicio trae `servicios: []`.
  - (b) `POST /api/portal/citas` con `servicioIds: []` y `motivo: "   "` → 409 con el mensaje exacto.
  - (c) Con `servicioIds: [A, A, B]` → 201 y la cita tiene 2 servicios.
  - (d) Solo `motivo: "ruido en frenos"` → 201, `servicios: []`, y el motivo guardado.
  - (e) Con un servicio inactivo → 409 con el mensaje de servicio inválido.
  - (f) `PUT /api/citas/{id}` ya no cambia el motivo.
  - (g) Abrir una orden de una cita con 2 servicios → la orden nace con las 2 líneas.

### Task 2: La cotización cuelga de la cita y la respuesta confirma la cita (API)

**Files:**
- Create: `Data/Migrations/<ts>_CotizacionPorCita.cs` (+ Designer y snapshot)
- Modify: `Entidades/Cotizacion.cs`, `Entidades/CotizacionConfiguracion.cs`, `Servicios/CotizacionService.cs`, `Controllers/CotizacionesController.cs`, `Servicios/CitaService.cs`, `Servicios/OrdenTrabajoService.cs`, `Servicios/NotificacionWhatsAppService.cs`

**Interfaces:**
- Consumes: `Cita.Servicios` (Tarea 1).
- Produces:
  - `Cotizacion.CitaId : int` + `Cita Cita`. `OrdenTrabajoId` y su navegación desaparecen.
  - Ruta `api/citas/{citaId:int}/cotizaciones`: `GET` con política `OrdenesLeer` y `POST` con `OrdenesCotizar`. El `POST` responde 201 en `/api/citas/{citaId}/cotizaciones`.
  - `CotizacionService.ObtenerDeCitaAsync(int citaId, ct)`, `CrearAsync(int citaId, CrearCotizacionRequest, int usuarioId, ct) : Task<int?>` (`null` = cita inexistente o fuera de alcance), `ResponderAsync(...)` con la misma firma que hoy.
  - `NotificacionWhatsAppService.CotizacionEnviadaAsync(int idCita, decimal total)`, que usa `DeCita` y agrega `Enlace(datos)`.

- [ ] **Step 1:** Entidad y configuración: FK `CitaId` → `Citas` con `Restrict` e índice en `CitaId`.
- [ ] **Step 2:** `dotnet ef migrations add CotizacionPorCita`. Editar el `Up` en este orden:
  1. `AddColumn CitaId` nullable.
  2. `Sql("UPDATE customcore.\"Cotizaciones\" q SET \"CitaId\" = o.\"CitaId\" FROM customcore.\"OrdenesTrabajoEncabezado\" o WHERE o.\"IdOrdenEncabezado\" = q.\"OrdenTrabajoId\";")`.
  3. `AlterColumn` a `NOT NULL`. Falla solo si alguna orden no tiene cita, que es lo que pide la spec.
  4. Índice y FK.
  5. `DropForeignKey`/`DropIndex`/`DropColumn` de `OrdenTrabajoId`.

  Antes de aplicarla, consultar en local `SELECT count(*) FROM customcore."Cotizaciones" q JOIN customcore."OrdenesTrabajoEncabezado" o ON o."IdOrdenEncabezado" = q."OrdenTrabajoId" WHERE o."CitaId" IS NULL` → tiene que dar 0. Luego `dotnet ef database update`.
- [ ] **Step 3:** Alcance en `CotizacionService`:
  - empleado: `c.Cita.SucursalId == alcance`;
  - mecánico restringido: `db.OrdenesTrabajoEncabezado.Any(o => o.CitaId == c.CitaId && o.MecanicoAsignadoId == mecanico)`;
  - cliente: `c.Cita.Vehiculo.ClienteId == clienteId`.

  `CrearAsync`: la cita existe y está en alcance (si no, `null`); si está `Cancelada`, 409 `No se puede cotizar una cita cancelada.`; si tiene orden, `EstaAbiertaParaEditarLineasAsync(idOrden)` tiene que ser no nulo (si no, 409 con el mensaje que ya usa esa ruta). Después de guardar, `CotizacionEnviadaAsync(citaId, total)`.
- [ ] **Step 4:** `ResponderInternoAsync`:
  1. Resolver `citaId` filtrando por cliente; si no hay, `false`.
  2. `BloquearFilaAsync<Cita>(citaId)`. Si la cita tiene orden, además `BloquearFilaAsync<OrdenTrabajoEncabezado>(idOrden)`.
  3. Cita `Cancelada` → 409 `Esta cita ya fue cancelada.`. Cotización ya respondida → mensaje actual.
  4. **Con orden:** se comporta como hoy, con las líneas a la orden y `RecalcularTotalAsync`.
  5. **Sin orden:** solo se marca la cotización.
  6. Si la cita está `Pendiente`:
     - al aceptar → `Confirmada`;
     - al rechazar sin otras cotizaciones `Pendiente` → `Confirmada` si `Servicios.Any()`, o `Cancelada` si no tiene servicios.
  7. El cambio de estado va con `ActualizarAuditadoAsync`, como en `CambiarEstadoAsync`.
  8. Después de la transacción, si quedó `Confirmada`, llamar a `whatsApp.CitaConfirmadaAsync(citaId)`. Al cancelar no se manda aviso.

  `ResponderAsync` devuelve `bool` como hoy; el aviso se manda fuera de `EjecutarUnidadAuditadaAsync`.
- [ ] **Step 5:** `CitaService.CambiarEstadoAsync`: envolver en `EjecutarUnidadAuditadaAsync` con `BloquearFilaAsync<Cita>(id)` antes del update, igual que `ReprogramarAsync`. El aviso de confirmada se manda después. `OrdenTrabajoService` al crear desde cita: después de las líneas de servicio y del request, agregar las líneas "Adicional" (`Descripcion`, `Cantidad`, `PrecioUnitario`, `SubtotalEstimado = Subtotal`) de `db.Cotizaciones.Where(q => q.CitaId == cita && q.Estado == Aceptada).SelectMany(q => q.Detalles)`, en orden de `IdCotizacionDetalle`, dentro de la misma transacción y antes de calcular el total.
- [ ] **Step 6: Verificar.** Build con 0 errores. Con `curl`:
  - (a) Cita del portal con 1 servicio y motivo; `POST /api/citas/{id}/cotizaciones` (recepción) → 201. El cliente acepta en `/api/portal/cotizaciones/{q}/respuesta` → la cita queda `Confirmada`.
  - (b) Lo mismo, pero el cliente rechaza → `Confirmada` y conserva su servicio. Con una cita solo con motivo → `Cancelada`, y el bloque vuelve a estar libre en `disponibilidad`.
  - (c) Abrir la orden de (a) mandando también el servicio de la cita en `lineas` → la orden tiene el servicio una vez y cada línea de la cotización una vez, como "Adicional", y el total las incluye.
  - (d) Con la orden abierta, crear y aceptar otra cotización → las líneas entran a la orden en el momento, como hoy.
  - (e) Recepción cancela la cita con `PATCH /estado` y luego el cliente acepta → 409 `Esta cita ya fue cancelada.`.
  - (f) `GET /api/citas/{id}/cotizaciones` con un token de Operario asignado a la orden → 200; con uno no asignado → lista vacía.
  - (g) Cotizar una cita cancelada → 409 con el mensaje exacto.

### Task 3: Etapa derivada de la cita pendiente (API)

**Files:**
- Create: `Entidades/EtapaCita.cs`
- Modify: `Dtos/CitaDtos.cs`, `Dtos/PortalDtos.cs`, `Servicios/CitaService.cs`, `Servicios/PortalService.cs`

**Interfaces:**
- Consumes: `Cotizacion.CitaId` (Tarea 2).
- Produces:
  - `public enum EtapaCita { PorConfirmar = 0, PorCotizar = 1, EsperandoRespuesta = 2 }`. Se serializa como texto, igual que `EstadoCita`.
  - `CitaListaDto` y `CitaDetalleDto` ganan `EtapaCita? Etapa` al final (`null` si la cita no está `Pendiente`).
  - `CitaPortalDto` y `SeguimientoCitaDto` ganan `bool CotizacionPendiente` al final.

- [ ] **Step 1:** Proyección, en el orden de la tabla de la spec:
  - `Estado != Pendiente` → `null`;
  - hay una cotización `Pendiente` → `EsperandoRespuesta`;
  - `Motivo != null` y no hay ninguna cotización → `PorCotizar`;
  - si no → `PorConfirmar`.

  Se escribe una sola vez como `Expression<Func<Cita, EtapaCita?>>` estática en `CitaService` y se usa en las dos proyecciones con `.Select` sobre un tipo anónimo, o se repite inline si EF no compone la expresión. Lo que funcione, sin librerías nuevas.
- [ ] **Step 2:** `CotizacionPendiente` en el portal es `db.Cotizaciones.Any(q => q.CitaId == c.IdCita && q.Estado == Pendiente)`.
- [ ] **Step 3: Verificar.** Build con 0 errores. Con `curl`, en `GET /api/citas`:
  - cita solo con servicio → `etapa: "PorConfirmar"`;
  - con motivo → `"PorCotizar"`;
  - después de cotizar → `"EsperandoRespuesta"`;
  - confirmada → `null`.

  En `GET /api/portal/citas`, `cotizacionPendiente` vale `true` mientras la cotización no se responde.

### Task 4: Agendar con casillas y textos del portal y del mostrador (front)

**Files:**
- Modify: `src/features/citas/types.ts`, `src/features/citas/formato.ts`, `src/features/citas/actions.ts`, `src/features/citas/components/AgendarCitaWizard.tsx`, `CitaCard.tsx`, `SeguimientoCita.tsx`, `src/app/(sitio)/panel/citas/nueva/page.tsx`, `src/features/mostrador/types.ts`, `src/features/mostrador/actions.ts`, `src/features/mostrador/components/NuevaCitaTallerWizard.tsx`

**Interfaces:**
- Consumes: el JSON de las Tareas 1 y 3.
- Produces:
  - `servicio: string | null` → `servicios: string[]` en `CitaPortal`, `SeguimientoCita` y `CitaTaller`;
  - `NuevaCita = { vehiculoId; sucursalId; servicioIds: number[]; motivo: string | null; fechaHora }`;
  - `CitaPortal.cotizacionPendiente` y `SeguimientoCita.cotizacionPendiente: boolean`;
  - `CitaTaller.etapa: "PorConfirmar" | "PorCotizar" | "EsperandoRespuesta" | null`;
  - en `src/features/citas/formato.ts`: `unirServicios(servicios: string[]): string | null`, con `new Intl.ListFormat("es", { type: "conjunction" })` y `null` si la lista está vacía.

- [ ] **Step 1:** Tipos y `unirServicios`. Títulos: `CitaCard.tsx:9` y `SeguimientoCita.tsx:47` → `unirServicios(x.servicios) ?? (x.motivo?.trim() || "Cita en el taller")`. `CitaCard` muestra un badge `Cotización por responder` cuando `cotizacionPendiente`.
- [ ] **Step 2:** `AgendarCitaWizard`: cambiar el select por casillas (`checkbox checkbox-primary`, una por servicio, con su tarifa en `formatearMoneda`) y un `textarea` (`maxLength={500}`) con la etiqueta exacta. `completo = vehiculo && sucursal && fechaHora && (seleccionados.length > 0 || motivo.trim())`. En el paso 2: lista de servicios elegidos, el estimado como suma de tarifas (se oculta si no hay servicios), el texto del cliente, y el aviso exacto si hay texto. Cambiar el texto de `page.tsx:67` a `Elige tu vehículo, la sede, los servicios o cuéntanos qué necesitas, y la fecha. El taller confirma la cita antes de tu visita.`
- [ ] **Step 3:** Server action `agendarCita` (en `src/features/citas/actions.ts`): manda `servicioIds` y `motivo` (recortado, o `null`). El mostrador recibe lo mismo en `NuevaCitaTallerWizard`, `mostrador/types.ts` y `mostrador/actions.ts:81-91`: la validación pasa a "vehículo, fecha y al menos un servicio o texto", con el mensaje `Elige al menos un servicio o cuéntanos qué necesitas que revisemos.`
- [ ] **Step 4: Verificar.** `npx tsc --noEmit`, `npx eslint src` y `npx next build` limpios. En el navegador:
  - (a) agendar con 2 servicios y texto: el paso 2 muestra los dos, el estimado sumado y el aviso;
  - (b) agendar solo con texto: no aparece el estimado;
  - (c) sin nada, no deja continuar;
  - (d) "Mis citas" titula "Cambio de aceite y Alineación";
  - (e) el mostrador crea una cita solo con texto;
  - (f) a 360 px de ancho, sin scroll horizontal.

### Task 5: Admin de citas, cotizar desde la cita y órdenes (front)

**Files:**
- Modify: `src/features/cotizaciones/dal.ts`, `src/features/cotizaciones/actions.ts`, `src/features/cotizaciones/components/CotizacionesOrden.tsx` (y `NuevaCotizacionForm.tsx` si recibe `idOrden`), `src/features/citas/components/HotCitas.tsx`, `DetalleCitaTaller.tsx`, `src/features/ordenes/types.ts`, `src/features/ordenes/components/AbrirOrden.tsx`, `DetalleOrden.tsx`, `OrdenCard.tsx`, `TableroOrdenes.tsx`, y el formulario o action de reprogramar cita (buscar `motivo` en `src/features/citas/actions.ts` y `AccionesCita.tsx`)

**Interfaces:**
- Consumes: `unirServicios` y tipos (Tarea 4); rutas de la Tarea 2.
- Produces:
  - `obtenerCotizacionesDeOrden(idOrden)` → `obtenerCotizacionesDeCitaTaller(idCita)` sobre `/api/citas/${idCita}/cotizaciones`;
  - `crearCotizacion(idCita, nota, lineas)` sobre la misma ruta;
  - `CotizacionesOrden` recibe `idCita` en lugar de `idOrden`;
  - el 404 de `traducirError` dice `La cotización o la cita ya no existe.`.

- [ ] **Step 1:** Cotizaciones por cita: `DetalleOrden.tsx:165` le pasa `orden.citaId`. Si el tipo de la orden no tiene `citaId`, agregarlo en `ordenes/types.ts` y confirmar que la API lo devuelve en el detalle; si no lo devuelve, agregarlo en el DTO de detalle de orden de la API.
- [ ] **Step 2:** `DetalleCitaTaller`:
  - `Dato` "Servicios" con `unirServicios(...) ?? "Sin servicios"`;
  - el texto del cliente en un bloque visible con el título `Lo que pidió el cliente`;
  - la etiqueta de etapa como badge;
  - y, si la cita no está cancelada y el usuario tiene `ordenes.cotizar` (o `ordenes.leer` para solo ver), la sección `CotizacionesOrden` con `idCita`.

  `HotCitas.tsx:76` → `unirServicios(cita.servicios) ?? "Sin servicios"`, y una columna "Etapa" con las tres etiquetas exactas (vacía si `etapa` es `null`).
- [ ] **Step 3:** `AbrirOrden.tsx:78-82`: "Servicios" con `unirServicios` y el texto del cliente, si hay. La nota exacta de las restricciones globales. `OrdenCard.tsx:26` y `TableroOrdenes.tsx:39` usan `unirServicios`. Reprogramar deja de mandar `motivo`, y si el formulario tenía ese campo, se quita.
- [ ] **Step 4: Verificar.** `npx tsc --noEmit`, `npx eslint src` y `npx next build` limpios. En el navegador, con la API local:
  - (a) una cita del portal con texto sale "Por cotizar" en la lista;
  - (b) en su detalle se crea la cotización y pasa a "Esperando respuesta";
  - (c) el cliente la acepta en su seguimiento y la cita aparece confirmada en el admin;
  - (d) al abrir la orden, la pantalla muestra servicios y texto, y la orden trae las líneas "Adicional";
  - (e) en el detalle de la orden se ven las mismas cotizaciones y se puede crear otra;
  - (f) con un usuario Operario, el detalle de su orden muestra las cotizaciones.
