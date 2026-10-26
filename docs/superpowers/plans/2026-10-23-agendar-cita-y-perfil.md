# Agendar cita y Mi perfil — Plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usar superpowers:subagent-driven-development (recomendada) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** que el cliente registre sus vehículos en "Mi perfil" y agende una cita eligiendo vehículo, sede, servicio y un horario libre en un calendario que respeta 3 carros por sede y citas de 1 hora.

**Arquitectura:** todo lo nuevo de la API va en `PortalController`/`PortalService` (`api/portal`, solo `[Authorize]`; el alcance sale del `ClienteId` de la sesión). Las reglas de horario viven en una clase estática `HorarioTaller` y solo en el backend; el front pinta lo que devuelve `disponibilidad`. La cita gana `ServicioId` (migración). El front usa server components para leer y server actions para escribir y para pedir disponibilidad desde el wizard cliente; el calendario es `react-day-picker` v9.

**Stack:** .NET 8 + EF Core 8 (Npgsql); Next.js 16 (`cacheComponents`), React 19, Tailwind 4 + daisyUI 5, `react-day-picker` (versión vigente, 10.x; su API se confirma en la Tarea 6, Paso 1).

**Spec:** `docs/superpowers/specs/2026-10-23-agendar-cita-y-perfil-design.md`

## Restricciones globales

- Front: `C:\Users\roood\OneDrive\Escritorio\Carpetas\Octavo Semestre\Desarrollo Web\Frontlossantos` (rama `Local/FeatureAutenticacion`). API: trabajar en `C:\Users\roood\source\repos\CustomCore.API\CustomCore.API` (rama `Local/FeatureSucursales`; arranca con `PortalController.cs`, `PortalService.cs`, `PortalDtos.cs` y el registro en `Program.cs` sin commitear: son el punto de partida, no revertir).
- **Rodrigo hace todos los commits.** Ninguna tarea ejecuta `git commit` ni `push`. Al cierre de cada tarea: resumir qué cambió y seguir.
- **Sin subagentes**: se ejecuta inline (preferencia del usuario).
- La migración se aplica solo a una base cuyo host sea `localhost` (verificar sin imprimir la cadena). Supabase lo aplica Rodrigo a mano antes del merge.
- No hay pruebas automatizadas en ningún repo. Verificación: API → `dotnet build --nologo -v q -o "$TEMP/cc-api-check"` (el `bin` normal suele estar bloqueado por Visual Studio) con 0 errores; front → `npx tsc --noEmit`, `npx eslint src`, `npx next build`. Los escenarios de cada tarea se prueban con `curl` contra la API local (`http://localhost:5239`, token de un cliente en `$TOKEN`) o en el navegador.
- Comentarios en la API solo con `//[INICIO][23/10/2026][Rodriale][motivo]` … `//[FIN][23/10/2026][Rodriale][motivo]`. En el front, sin comentarios nuevos.
- Valores fijos de la spec: capacidad **3** por sede y bloque; duración **60** min; zona **America/Guatemala**; horario **L–V 8:00–18:00, sábado 8:00–13:00, domingo cerrado**; ventana **siguiente hora en punto → +60 días**; rango máximo de `disponibilidad` **62 días**.
- Mensaje de placa repetida, exacto: `Esa placa ya está registrada en el taller. Comunícate con nosotros.`
- Next.js 16: antes de usar `refresh`, `redirect` en server actions o `Suspense` con sesión, leer `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/refresh.md` y `02-guides/authentication-with-cache-components.md`.

## Foco de revisión

1. **Dos clientes reservan el último lugar del mismo bloque a la vez:** uno recibe 201 y el otro 409; nunca 4 citas en el bloque. → Tarea 4, Paso 4 (escenario d).
2. **`fechaHora` que no es inicio de bloque llamando directo a la API** (8:30, domingo, 18:00 L–V, 13:00 sábado, pasado, a 61 días): 409, no se crea la cita. → Tarea 4, Paso 4 (escenario b).
3. **`vehiculoId` de otro cliente:** 404, igual que uno inexistente. → Tarea 4, Paso 4 (escenario c).
4. **Cita del taller de 90 min a las 9:00:** ocupa también el bloque de 10:00 en la disponibilidad. → Tarea 3, Paso 3 (escenario b).
5. **Placa con otro formato** (`p-661wrt ` contra `P-661WRT` existente): 409 con el mensaje exacto, sin crear el vehículo. → Tarea 2, Paso 3 (escenario b).

---

## Mapa de archivos

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| API `Entidades/Cita.cs`, `Entidades/CitaConfiguracion.cs`, `Data/Migrations/*_CitaConServicio.*` | `ServicioId` en la cita | 1 |
| API `Dtos/PortalDtos.cs` | DTOs del portal | 1–4 |
| API `Servicios/PortalService.cs` | consultas y altas del portal | 1–4 |
| API `Controllers/PortalController.cs` | endpoints `api/portal/*` | 2–4 |
| API `Servicios/HorarioTaller.cs` (nuevo) | reglas de horario, bloques y ventana | 3 |
| Front `src/components/PanelNavbar.tsx`, `src/app/panel/layout.tsx` | menú con "Mi perfil" / "Cerrar sesión" | 5 |
| Front `src/app/panel/perfil/page.tsx` | página Mi perfil | 5 |
| Front `src/features/vehiculos/{types,dal,actions}.ts`, `components/{VehiculosLista,RegistrarVehiculoForm}.tsx` | vehículos | 5 |
| Front `src/features/citas/{types,dal,actions}.ts`, `components/{AgendarCitaWizard,SelectorFechaHora,Stepper}.tsx` | wizard de agendar | 6 |
| Front `src/app/panel/citas/nueva/page.tsx` | página Agendar cita | 6 |
| Front `src/features/citas/components/CitaCard.tsx` | título = servicio | 1 (front) |

---

### Task 1: `ServicioId` en la cita y título por servicio en "Mis citas"

**Files:**
- Modify: API `Entidades/Cita.cs`, `Entidades/CitaConfiguracion.cs`, `Dtos/PortalDtos.cs`, `Servicios/PortalService.cs`
- Create: API `Data/Migrations/<timestamp>_CitaConServicio.cs` (+ Designer, snapshot)
- Modify: Front `src/features/citas/types.ts`, `src/features/citas/components/CitaCard.tsx`

**Interfaces:**
- Produces: `Cita.ServicioId : int?`, `Cita.Servicio : Servicio?`; `CitaPortalDto(int IdCita, string? Servicio, string? Motivo, string Marca, string Modelo, int Anio, string Placa, DateTimeOffset FechaHora, EstadoCita Estado)`; front `CitaPortal.servicio: string | null`.

- [ ] **Step 1:** Agregar `public int? ServicioId { get; set; }` y `public Servicio? Servicio { get; set; }` a `Cita`; en `CitaConfiguration`, `HasOne(c => c.Servicio).WithMany().HasForeignKey(c => c.ServicioId).OnDelete(DeleteBehavior.Restrict)`.
- [ ] **Step 2:** `dotnet ef migrations add CitaConServicio`. Revisar que el `Up` solo agregue la columna nullable `ServicioId`, su índice y la FK (nada más). Verificar host `localhost` y `dotnet ef database update`.
- [ ] **Step 3:** `CitaPortalDto` gana `string? Servicio` como segundo parámetro; `ObtenerCitasAsync` proyecta `c.Servicio != null ? c.Servicio.Nombre : null`.
- [ ] **Step 4:** Front: `servicio: string | null` en `CitaPortal`; en `CitaCard` el título es `cita.servicio ?? (cita.motivo?.trim() || "Cita en el taller")`.
- [ ] **Step 5: Verificar.** Build API (0 errores); `curl -H "Authorization: Bearer $TOKEN" localhost:5239/api/portal/citas` trae `"servicio": null` en citas viejas; `npx tsc --noEmit` limpio.

### Task 2: Catálogos y vehículos del portal (API)

**Files:** Modify API `Dtos/PortalDtos.cs`, `Servicios/PortalService.cs`, `Controllers/PortalController.cs`

**Interfaces:**
- Produces (JSON camelCase):
  - `GET /api/portal/sucursales` → `SucursalPortalDto(int IdSucursal, string Nombre, string Direccion)[]` (solo `Activo`, orden por nombre)
  - `GET /api/portal/servicios` → `ServicioPortalDto(int IdServicio, string Nombre, decimal TarifaManoObra)[]` (solo `Activo`, orden por nombre)
  - `GET /api/portal/vehiculos` → `VehiculoPortalDto(int IdVehiculo, string Marca, string Modelo, int Anio, string Placa)[]` del cliente, orden por marca, modelo
  - `POST /api/portal/vehiculos` body `RegistrarVehiculoRequest([Required, MaxLength(20)] string Placa, [Required, MaxLength(50)] string Marca, [Required, MaxLength(50)] string Modelo, [Range(1900, 2100)] int Anio)` → `201` con `{ idVehiculo }`; `409` placa repetida.
  - Service: `ObtenerSucursalesAsync(ct)`, `ObtenerServiciosAsync(ct)`, `ObtenerVehiculosAsync(int idUsuario, ct)`, `RegistrarVehiculoAsync(int idUsuario, RegistrarVehiculoRequest, ct) : Task<int>`.

- [ ] **Step 1:** Extraer en el controller un helper privado `bool TryObtenerIdUsuario(out int idUsuario)` y usarlo en todos los endpoints (los dos existentes incluidos).
- [ ] **Step 2:** Implementar. En `RegistrarVehiculoAsync`: placa = `Trim().ToUpperInvariant()`, marca/modelo `Trim()`; si `db.Vehiculos.AnyAsync(v => v.Placa.ToUpper() == placa)` → `ConflictoNegocioException` con el mensaje exacto de las restricciones; `ClienteId` del usuario (vía `ObtenerClienteIdAsync`).
- [ ] **Step 3: Verificar** con `curl`: (a) POST válido → 201 y aparece en GET vehiculos; (b) POST con `"placa":" p-661wrt "` cuando existe `P-661WRT` (de otro cliente o propio) → 409 con el mensaje exacto y GET no cambia; (c) POST con `anio: 1800` → 400; (d) token de empleado → 403 en vehiculos; (e) sucursales y servicios solo traen activos.

### Task 3: Horario del taller y disponibilidad (API)

**Files:** Create API `Servicios/HorarioTaller.cs`; Modify `Dtos/PortalDtos.cs`, `Servicios/PortalService.cs`, `Controllers/PortalController.cs`

**Interfaces:**
- Produces:
  - `public static class HorarioTaller` con `const int CapacidadPorBloque = 3`, `const int DuracionMinutos = 60`, `const int DiasVentana = 60`, `static readonly TimeZoneInfo Zona` (`FindSystemTimeZoneById("America/Guatemala")`), `IReadOnlyList<DateTimeOffset> BloquesDelDia(DateOnly fecha)` (inicios en hora local con su offset; vacío en domingo), `bool EsInicioDeBloque(DateTimeOffset fechaHora)`, `bool DentroDeVentana(DateTimeOffset inicio, DateTimeOffset ahora)` (`inicio >= siguiente hora en punto local` y `inicio <= ahora + 60 días`).
  - `record ConsultaDisponibilidad { [Range(1, int.MaxValue)] int SucursalId; DateOnly Desde; DateOnly Hasta }` (query string).
  - `HorarioDisponibleDto(DateTimeOffset FechaHora, bool Disponible, bool Lleno)`; `DiaDisponibilidadDto(DateOnly Fecha, IReadOnlyList<HorarioDisponibleDto> Horarios)`.
  - `GET /api/portal/disponibilidad?sucursalId=&desde=yyyy-MM-dd&hasta=yyyy-MM-dd` → `DiaDisponibilidadDto[]`, un elemento por día del rango (domingos con `horarios: []`).
  - Service: `ObtenerDisponibilidadAsync(ConsultaDisponibilidad, ct)`; helper interno reutilizable `Task<List<(DateTimeOffset Inicio, int Minutos)>> CitasActivasDeSedeAsync(int sucursalId, DateTimeOffset desde, DateTimeOffset hasta, ct)`.

- [ ] **Step 1:** `HorarioTaller`: bloques L–V 8..17, sábado 8..12 (inicio en punto, 60 min). `EsInicioDeBloque` convierte a hora local y comprueba que coincide exactamente con un elemento de `BloquesDelDia`.
- [ ] **Step 2:** `ObtenerDisponibilidadAsync`: `Hasta < Desde` o más de 62 días → `SolicitudInvalidaException`; sede inexistente o inactiva → `SolicitudInvalidaException("La sede no existe o no está disponible.")`. Una sola consulta de citas no canceladas de la sede con `FechaHora` entre el inicio del primer día −1 día y el fin del último día (+1 día de margen, como `ValidarSolapamientoAsync`). Para cada bloque: `ocupadas = citas que cumplen inicio < finBloque && inicioBloque < inicio + minutos`; `Lleno = ocupadas >= 3`; `Disponible = !Lleno && DentroDeVentana(bloque, DateTimeOffset.UtcNow)`.
- [ ] **Step 3: Verificar** con `curl`: (a) un lunes devuelve 10 horarios 08:00…17:00 con offset `-06:00`, un sábado 5 (08:00…12:00), domingo `[]`; (b) con una cita del taller de 90 min a las 9:00 más 2 citas a las 10:00 en la misma sede, el bloque 10:00 sale `lleno: true` y el de 9:00 `lleno: false`; (c) bloques de hoy ya pasados → `disponible: false, lleno: false`; (d) rango de 70 días → 400.

### Task 4: Agendar cita desde el portal (API)

**Files:** Modify API `Dtos/PortalDtos.cs`, `Servicios/PortalService.cs`, `Controllers/PortalController.cs`

**Interfaces:**
- Consumes: `HorarioTaller`, `CitasActivasDeSedeAsync` (Tarea 3), `ObtenerClienteIdAsync`.
- Produces: `AgendarCitaRequest([Range(1, int.MaxValue)] int VehiculoId, [Range(1, int.MaxValue)] int SucursalId, [Range(1, int.MaxValue)] int ServicioId, DateTimeOffset FechaHora)`; `POST /api/portal/citas` → `201` `{ idCita }`, `404` vehículo ajeno o inexistente, `409` cualquier regla, con mensaje para el usuario. Service: `Task<int?> AgendarCitaAsync(int idUsuario, AgendarCitaRequest, ct)` (`null` = vehículo no es del cliente).

- [ ] **Step 1:** Fuera de la transacción: vehículo del cliente (si no → `null`); servicio activo; `EsInicioDeBloque` y `DentroDeVentana` (si no → 409 `"Elige un horario disponible del calendario."`).
- [ ] **Step 2:** Dentro de `db.EjecutarUnidadAuditadaAsync`: `BloquearFilaAsync<Sucursal>(sucursalId)`; nula o `!Activo` → 409 `"La sede no existe o no está disponible."`; el vehículo no tiene otra cita no cancelada que se cruce con `[fechaHora, +60)` → si la tiene, 409 `"Tu vehículo ya tiene una cita en ese horario."`; `CitasActivasDeSedeAsync` cuenta cruces con el bloque, `>= 3` → 409 `"Ese horario se acaba de llenar. Elige otro."`; insertar `Cita { Estado = Pendiente, DuracionMinutos = 60, Motivo = null, ServicioId, SucursalId, VehiculoId, FechaHora }` y `SaveChangesAsync`.
- [ ] **Step 3:** Confirmar que `EjecutarUnidadAuditadaAsync` admite un `Add` + `SaveChangesAsync` dentro (leer `Data/AppDbContext.OperacionesAuditadas.cs` completo). Si no lo admite, usar `CreateExecutionStrategy` + `BeginTransactionAsync` como `RegistroService` y bloquear con `BloquearFilaAsync` dentro.
- [ ] **Step 4: Verificar** con `curl`: (a) agendar un bloque libre → 201 y aparece en `/api/portal/citas` con `servicio`; (b) `fechaHora` a las 08:30, domingo, 18:00 L–V, 13:00 sábado, ayer, +61 días → 409 cada uno y no se crea nada; (c) `vehiculoId` de otro cliente → 404; (d) dejar un bloque con 2 citas y lanzar dos POST en paralelo (`curl … & curl … & wait`) con dos vehículos distintos → uno 201 y otro 409, el bloque queda con 3; (e) servicio inactivo → 409.

### Task 5: Menú "Mi perfil" y página de perfil con vehículos (front)

**Files:**
- Modify: `src/components/PanelNavbar.tsx`, `src/app/panel/layout.tsx`
- Create: `src/app/panel/perfil/page.tsx`, `src/features/vehiculos/types.ts`, `dal.ts`, `actions.ts`, `components/VehiculosLista.tsx`, `components/RegistrarVehiculoForm.tsx`

**Interfaces:**
- Consumes: `obtenerMiPerfil()` (`src/features/perfil/dal.ts`, ya existe), endpoints de la Tarea 2.
- Produces: `type Vehiculo = { idVehiculo: number; marca: string; modelo: string; anio: number; placa: string }`; `obtenerMisVehiculos(): Promise<Vehiculo[]>`; `registrarVehiculo(prev: RegistrarVehiculoState, formData: FormData): Promise<RegistrarVehiculoState>` con `RegistrarVehiculoState = { error?: string; ok?: boolean; valores?: Record<string, string> } | undefined`.

- [ ] **Step 1:** `PanelNavbar` recibe `{ nombreCompleto: string }`; el desplegable (mismo estilo oscuro actual) tiene solo dos filas con círculo naranja: **Mi perfil** (`Link` a `/panel/perfil`, `FaRegUser`) y **Cerrar sesión** (form con `cerrarSesion`). El layout deja de llamar `obtenerMiPerfil` y pasa `usuario`.
- [ ] **Step 2:** `registrarVehiculo`: valida no vacíos y año 1900–2100 en el server; 409 → `error` con el `detail` de la API (leer el cuerpo ProblemDetails: ampliar `ApiError` con `detalle?: string` leyendo `res.json()` cuando `content-type` es `application/problem+json`; `apiFetch` lo llena); éxito → `refresh()` según `refresh.md` y `{ ok: true }`.
- [ ] **Step 3:** Página `/panel/perfil` (título "Mi perfil"): tarjeta "Mis datos" (nombre, correo, teléfono de `obtenerMiPerfil`) y tarjeta "Mis vehículos" (lista + formulario), cada una detrás de `<Suspense>` con esqueleto; mismo estilo de tarjetas que "Mis citas". Lista vacía: "Aún no registras vehículos".
- [ ] **Step 4:** El formulario conserva lo escrito si hay error y se limpia en éxito (`key` que cambia con `ok`).
- [ ] **Step 5: Verificar:** `npx tsc --noEmit`, `npx eslint src`, `npx next build`; en el navegador: menú muestra las dos opciones, Mi perfil carga datos, registrar vehículo lo agrega a la lista sin recargar, placa repetida muestra el mensaje exacto.

### Task 6: Wizard "Agendar cita" con calendario (front)

**Files:**
- Create: `src/app/panel/citas/nueva/page.tsx`, `src/features/citas/actions.ts`, `components/AgendarCitaWizard.tsx`, `components/SelectorFechaHora.tsx`, `components/Stepper.tsx`
- Modify: `src/features/citas/types.ts`, `src/features/citas/dal.ts`, `package.json`

**Interfaces:**
- Consumes: Tareas 2–4, `obtenerMisVehiculos` (Tarea 5), `formatearFechaCita` (`src/features/citas/formato.ts`).
- Produces:
  - types: `Sucursal { idSucursal; nombre; direccion }`, `Servicio { idServicio; nombre; tarifaManoObra: number }`, `HorarioDisponible { fechaHora: string; disponible: boolean; lleno: boolean }`, `DiaDisponibilidad { fecha: string; horarios: HorarioDisponible[] }`.
  - dal: `obtenerSucursales()`, `obtenerServicios()`, `obtenerDisponibilidad(sucursalId: number, desde: string, hasta: string)`, `crearCita(datos: NuevaCita): Promise<number>` con `NuevaCita = { vehiculoId: number; sucursalId: number; servicioId: number; fechaHora: string }`.
  - actions: `consultarDisponibilidad(sucursalId: number, desde: string, hasta: string): Promise<{ dias: DiaDisponibilidad[] } | { error: string }>`; `agendarCita(datos: NuevaCita): Promise<{ error: string } | undefined>` (éxito → `redirect("/panel")`).
  - `AgendarCitaWizard({ vehiculos, sucursales, servicios })` (`"use client"`); `SelectorFechaHora({ sucursalId, valor, onCambio }: { sucursalId: number; valor: string | null; onCambio: (fechaHora: string | null) => void })`; `Stepper({ paso }: { paso: 1 | 2 })` con etiquetas "Datos de la cita" y "Confirmación".

- [ ] **Step 1:** `npm i react-day-picker`; leer su README en `node_modules/react-day-picker` para la API de `DayPicker` (`mode="single"`, `onMonthChange`, `modifiers`, `modifiersClassNames`, `disabled`, `locale` es, hoja de estilos) y para cómo cambiar el color de acento a `var(--color-primary)`.
- [ ] **Step 2:** `SelectorFechaHora`: al montar o al cambiar `sucursalId` o el mes visible, pide `consultarDisponibilidad` del primer al último día del mes (fechas como `yyyy-MM-dd` del calendario, sin conversión de zona). Día deshabilitado si no tiene ningún horario `disponible`. Modificador `lleno` (punto bajo el número, color `primary`) si tiene horarios, ninguno disponible y al menos uno `lleno`. Debajo, para el día elegido, una rejilla de botones con la hora (`Intl` es-GT, zona America/Guatemala, ej. "8:00 a. m."); `lleno` → deshabilitado, atenuado y con la palabra "Lleno"; no disponible → deshabilitado. Mientras carga: esqueleto; error: texto con botón "Reintentar". Al cambiar sede o día se limpia la hora elegida (`onCambio(null)`).
- [ ] **Step 3:** `AgendarCitaWizard` paso 1: selects nativos estilo daisyUI (`select select-bordered rounded-field`) de **Vehículo** (`Marca Modelo Año · PLACA`), **Sede** (nombre — dirección), **Servicio** (nombre); ayuda bajo Servicio: "El precio es estimado; puede variar tras el diagnóstico."; ayuda bajo el calendario: "Lunes a viernes de 8:00 a 18:00, sábados de 8:00 a 13:00." Botón "Continuar" deshabilitado hasta tener los cuatro valores. Paso 2: resumen (vehículo, sede, servicio con "Mano de obra estimada: Q…" vía `Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" })`, fecha con `formatearFechaCita`), botones "Volver" (conserva todo) y "Confirmar cita" (pendiente con `useTransition`). Si `agendarCita` devuelve `error`: volver al paso 1, mostrar el error en un `alert` y forzar recarga de disponibilidad (por ejemplo, un contador `version` en la `key` de `SelectorFechaHora`).
- [ ] **Step 4:** Página `/panel/citas/nueva`: título "Agendar una cita", subtítulo "Elige tu vehículo, la sede, el servicio y la fecha. El taller confirma la cita antes de tu visita.", enlace "Mis citas /" arriba; carga en paralelo vehículos, sedes y servicios detrás de `<Suspense>`. Sin vehículos: aviso "Primero registra tu vehículo" con botón a `/panel/perfil` en lugar del wizard.
- [ ] **Step 5: Verificar:** `npx tsc --noEmit`, `npx eslint src`, `npx next build`. En el navegador, con API local: (a) domingos y días pasados deshabilitados; (b) día con todos sus bloques llenos muestra el punto y no se puede elegir; (c) horas llenas dicen "Lleno"; (d) agendar → vuelve a "Mis citas" y la tarjeta muestra el servicio como título y badge "Programada"; (e) llenar el bloque desde otra cuenta entre los pasos 1 y 2 → al confirmar vuelve al paso 1 con "Ese horario se acaba de llenar. Elige otro." y la hora ya sale como "Lleno"; (f) vista de 360 px de ancho sin scroll horizontal.
