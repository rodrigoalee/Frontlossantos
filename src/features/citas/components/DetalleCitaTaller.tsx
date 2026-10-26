import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import { formatearTelefono } from "@/features/clientes/formato";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { ApiError } from "@/lib/api";
import { obtenerCitaDelTaller, obtenerSucursales } from "../dal";
import { formatearDuracion, formatearFechaCita, PRESENTACION_ESTADO } from "../formato";
import type { CitaTallerDetalle } from "../types";
import AccionesCita from "./AccionesCita";

const COLOR_ESTADO = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmada: "bg-emerald-100 text-emerald-800",
  Cancelada: "bg-red-100 text-red-800",
} as const;

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary">{children}</dd>
    </div>
  );
}

export default async function DetalleCitaTaller({ idCita }: { idCita: number }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);

  let cita: CitaTallerDetalle;
  let sede: string | undefined;
  try {
    const [detalle, sucursales] = await Promise.all([
      obtenerCitaDelTaller(idCita),
      obtenerSucursales().catch(() => []),
    ]);
    cita = detalle;
    sede = sucursales.find((sucursal) => sucursal.idSucursal === detalle.sucursalId)?.nombre;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          {error.detalle ?? "No tienes permiso para consultar esta cita."}
        </p>
      );
    }
    throw error;
  }

  const estado = PRESENTACION_ESTADO[cita.estado];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <section className="flex flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-secondary">Cita #{cita.idCita}</h2>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${COLOR_ESTADO[cita.estado]}`}>
            {estado.etiqueta}
          </span>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2">
          <Dato etiqueta="Fecha y hora">{formatearFechaCita(cita.fechaHora)}</Dato>
          <Dato etiqueta="Duración">{formatearDuracion(cita.duracionMinutos)}</Dato>
          <Dato etiqueta="Sede">{sede ?? `Sede #${cita.sucursalId}`}</Dato>
          <Dato etiqueta="Servicio">{cita.servicio ?? "Sin servicio"}</Dato>
          <Dato etiqueta="Motivo">{cita.motivo?.trim() || "Sin motivo registrado"}</Dato>
        </dl>

        {cita.idOrden && permisos.has("ordenes.leer") && (
          <Link href={`/admin/ordenes/${cita.idOrden}`} className="btn btn-primary self-start rounded-full px-6">
            Ver orden #{cita.idOrden}
          </Link>
        )}
        {!cita.idOrden && cita.estado !== "Cancelada" && permisos.has("ordenes.crear") && (
          <Link href={`/admin/ordenes/nueva?cita=${cita.idCita}`} className="btn btn-primary self-start rounded-full px-6">
            Abrir orden de trabajo
          </Link>
        )}

        {permisos.has("citas.cambiar_estado") && !cita.idOrden && (
          <AccionesCita idCita={cita.idCita} estado={cita.estado} />
        )}
      </section>

      <aside className="flex flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-secondary">Cliente</h2>
          <dl className="flex flex-col gap-4">
            <Dato etiqueta="Nombre">{cita.nombreCliente}</Dato>
            <Dato etiqueta="Teléfono">
              <a href={`tel:${cita.telefonoCliente}`} className="hover:text-primary">
                {formatearTelefono(cita.telefonoCliente)}
              </a>
            </Dato>
          </dl>
          {permisos.has("clientes.leer") && (
            <Link href={`/admin/clientes/${cita.clienteId}`} className="btn btn-sm rounded-full">
              Ver ficha del cliente
            </Link>
          )}
        </section>

        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-secondary">Vehículo</h2>
          <dl className="flex flex-col gap-4">
            <Dato etiqueta="Placa">{formatearPlaca(cita.placa)}</Dato>
            <Dato etiqueta="Marca y modelo">
              {cita.marca} {cita.modelo}
            </Dato>
          </dl>
        </section>
      </aside>
    </div>
  );
}

export function DetalleCitaTallerCargando() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Cargando la cita">
      <CargandoPantalla texto="Cargando la cita…" />
      <div className="flex flex-col gap-5 rounded-3xl border border-base-300 p-8 lg:col-span-2">
        <div className="skeleton h-6 w-1/3" />
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="skeleton h-48 w-full rounded-3xl" />
        <div className="skeleton h-36 w-full rounded-3xl" />
      </div>
    </div>
  );
}
