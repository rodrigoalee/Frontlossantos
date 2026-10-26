import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import { formatearFechaCita, formatearMoneda } from "@/features/citas/formato";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { ApiError } from "@/lib/api";
import { obtenerInventario, obtenerMecanicos, obtenerOrden, obtenerServiciosActivos } from "../dal";
import { PRESENTACION_ESTADO_ORDEN } from "../formato";
import type { MecanicoDisponible, OrdenDetalle, RepuestoInventario, ServicioCatalogo } from "../types";
import AgregarLineaForm from "./AgregarLineaForm";
import BotonEstadoOrden from "./BotonEstadoOrden";
import CambiarMecanicoForm from "./CambiarMecanicoForm";
import DiagnosticoOrden from "./DiagnosticoOrden";
import QuitarLineaBoton from "./QuitarLineaBoton";

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary">{children}</dd>
    </div>
  );
}

export default async function DetalleOrden({ idOrden }: { idOrden: number }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);

  let orden: OrdenDetalle;
  try {
    orden = await obtenerOrden(idOrden);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          {error.detalle ?? "No tienes permiso para consultar esta orden."}
        </p>
      );
    }
    throw error;
  }

  const abierta = orden.estado !== "Finalizado";
  const puedeEditar = permisos.has("ordenes.editar") && abierta;
  const puedeReasignar = permisos.has("ordenes.crear") && abierta;

  let repuestos: RepuestoInventario[] = [];
  let servicios: ServicioCatalogo[] = [];
  let mecanicos: MecanicoDisponible[] = [];
  if (puedeEditar || puedeReasignar) {
    [repuestos, servicios, mecanicos] = await Promise.all([
      puedeEditar && permisos.has("inventario.leer") ? obtenerInventario(orden.sucursalId).catch(() => []) : [],
      puedeEditar && permisos.has("servicios.leer") ? obtenerServiciosActivos().catch(() => []) : [],
      puedeReasignar ? obtenerMecanicos(orden.sucursalId).catch(() => []) : [],
    ]);
  }

  const estado = PRESENTACION_ESTADO_ORDEN[orden.estado];

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <section className="flex flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-semibold text-secondary">Orden #{orden.idOrdenEncabezado}</h2>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${estado.insignia}`}>
              {estado.etiqueta}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Dato etiqueta="Ingreso">{formatearFechaCita(orden.fechaIngreso)}</Dato>
            <Dato etiqueta="Salida">
              {orden.fechaFinalizacion ? formatearFechaCita(orden.fechaFinalizacion) : "Todavía en el taller"}
            </Dato>
            <Dato etiqueta="Recibió">{orden.usuarioRecepcion}</Dato>
            <Dato etiqueta="Mecánico">{orden.mecanicoAsignado ?? "Sin asignar"}</Dato>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-base-content/50">Lo que reporta el cliente</h3>
            <p className="mt-1 whitespace-pre-line text-base-content/80">
              {orden.motivoIngreso?.trim() || "Sin motivo registrado"}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-base-content/50">Diagnóstico del mecánico</h3>
            {puedeEditar ? (
              <DiagnosticoOrden idOrden={orden.idOrdenEncabezado} inicial={orden.diagnostico} />
            ) : (
              <p className="whitespace-pre-line text-base-content/80">
                {orden.diagnostico?.trim() || "Sin diagnóstico todavía"}
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
          <h2 className="text-xl font-semibold text-secondary">Trabajo y repuestos</h2>
          {orden.lineas.length === 0 ? (
            <p className="text-sm text-base-content/60">Todavía no hay trabajo registrado en esta orden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th className="hidden text-right sm:table-cell">Cant.</th>
                    <th className="hidden text-right sm:table-cell">Precio</th>
                    <th className="text-right">Subtotal</th>
                    {puedeEditar && <th aria-label="Acciones" />}
                  </tr>
                </thead>
                <tbody>
                  {orden.lineas.map((linea) => (
                    <tr key={linea.idOrdenDetalle}>
                      <td>
                        <span className="text-xs text-base-content/50">{linea.tipoLinea}</span>
                        <span className="block font-semibold break-words text-secondary">{linea.descripcion}</span>
                        <span className="text-xs text-base-content/60 sm:hidden">
                          {linea.cantidad} × {formatearMoneda(linea.precioUnitario)}
                        </span>
                      </td>
                      <td className="hidden text-right sm:table-cell">{linea.cantidad}</td>
                      <td className="hidden text-right sm:table-cell">{formatearMoneda(linea.precioUnitario)}</td>
                      <td className="text-right font-semibold">{formatearMoneda(linea.subtotalEstimado)}</td>
                      {puedeEditar && (
                        <td className="text-right">
                          <QuitarLineaBoton
                            idOrden={orden.idOrdenEncabezado}
                            idLinea={linea.idOrdenDetalle}
                            descripcion={linea.descripcion}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="hidden text-right sm:table-cell">
                      Total estimado
                    </td>
                    <td className="text-right sm:hidden">Total estimado</td>
                    <td className="text-right text-base font-bold text-secondary">
                      {formatearMoneda(orden.totalEstimado)}
                    </td>
                    {puedeEditar && <td />}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          {puedeEditar && (
            <AgregarLineaForm idOrden={orden.idOrdenEncabezado} repuestos={repuestos} servicios={servicios} />
          )}
        </section>

        {abierta && permisos.has("ordenes.cambiar_estado") && (
          <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
            <h2 className="text-xl font-semibold text-secondary">Avance de la orden</h2>
            <BotonEstadoOrden idOrden={orden.idOrdenEncabezado} estado={orden.estado} />
          </section>
        )}
      </div>

      <aside className="flex flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-secondary">Vehículo y cliente</h2>
          <dl className="flex flex-col gap-4">
            <Dato etiqueta="Placa">{formatearPlaca(orden.placa)}</Dato>
            <Dato etiqueta="Marca y modelo">
              {orden.marca} {orden.modelo}
            </Dato>
            <Dato etiqueta="Cliente">{orden.nombreCliente}</Dato>
          </dl>
          <div className="flex flex-wrap gap-2">
            {orden.citaId && permisos.has("citas.leer") && (
              <Link href={`/admin/citas/${orden.citaId}`} className="btn btn-sm rounded-full">
                Ver la cita
              </Link>
            )}
            {permisos.has("clientes.leer") && (
              <Link href={`/admin/clientes/${orden.clienteId}`} className="btn btn-sm rounded-full">
                Ver ficha del cliente
              </Link>
            )}
          </div>
        </section>

        {puedeReasignar && (
          <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-secondary">Mecánico asignado</h2>
            <CambiarMecanicoForm
              idOrden={orden.idOrdenEncabezado}
              actual={orden.mecanicoAsignadoId}
              diagnostico={orden.diagnostico}
              mecanicos={mecanicos}
            />
          </section>
        )}
      </aside>
    </div>
  );
}

export function DetalleOrdenCargando() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Cargando la orden">
      <CargandoPantalla texto="Cargando la orden…" />
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-5 rounded-3xl border border-base-300 p-8">
          <div className="skeleton h-6 w-1/3" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="skeleton h-48 w-full rounded-3xl" />
      </div>
      <div className="skeleton h-48 w-full rounded-3xl" />
    </div>
  );
}
