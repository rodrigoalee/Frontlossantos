import { notFound, redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import {
  FaCheck,
  FaCircleExclamation,
  FaEnvelope,
  FaHeadset,
  FaPhone,
} from "react-icons/fa6";
import { ApiError } from "@/lib/api";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { CORREO_TALLER, TELEFONO_TALLER } from "@/lib/contacto";
import { obtenerSeguimiento } from "../dal";
import { formatearFechaCita } from "../formato";
import { construirHitos, esCancelada, type Hito } from "../seguimiento";
import type { SeguimientoCita as Seguimiento } from "../types";

export default async function SeguimientoCita({ idCita }: { idCita: number }) {
  let seguimiento: Seguimiento;
  try {
    seguimiento = await obtenerSeguimiento(idCita);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          Esta cuenta no pertenece a un cliente del taller.
        </p>
      );
    }
    throw error;
  }

  const hitos = construirHitos(seguimiento);
  const cancelada = esCancelada(seguimiento);
  const actual = hitos.findLast((hito) => hito.estado !== "pendiente");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="flex flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold break-words text-secondary">
              {seguimiento.servicio ?? (seguimiento.motivo?.trim() || "Cita en el taller")}
            </h2>
            <p className="text-sm text-base-content/60">Avance de tu visita</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              cancelada ? "bg-red-100 text-red-800" : "bg-primary/15 text-secondary"
            }`}
          >
            {cancelada ? "Cancelada" : actual?.titulo}
          </span>
        </div>

        {cancelada && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
            <FaCircleExclamation aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p>
              Esta cita fue cancelada, así que el seguimiento se detuvo. Si necesitas otra visita, agenda una nueva
              cita o contáctanos.
            </p>
          </div>
        )}

        <ol className="flex flex-col">
          {hitos.map((hito, i) => (
            <PasoHito key={hito.titulo} hito={hito} ultimo={i === hitos.length - 1} />
          ))}
        </ol>
      </section>

      <aside className="flex flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-secondary">Detalles de la cita</h2>
          <dl className="flex flex-col gap-4">
            <Dato etiqueta="Vehículo">
              {seguimiento.marca} {seguimiento.modelo} {seguimiento.anio} · {formatearPlaca(seguimiento.placa)}
            </Dato>
            <Dato etiqueta="Sede">{seguimiento.sucursal}</Dato>
            <Dato etiqueta="Fecha y hora">{formatearFechaCita(seguimiento.fechaHora)}</Dato>
          </dl>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-neutral p-5 text-neutral-content sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-neutral">
              <FaHeadset aria-hidden className="size-4" />
            </span>
            <div>
              <h2 className="font-semibold">¿Tienes dudas?</h2>
              <p className="text-sm text-neutral-content/70">Contáctanos y con gusto te ayudamos.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a href={`tel:${TELEFONO_TALLER}`} className="btn btn-primary rounded-full">
              <FaPhone aria-hidden className="size-4" />
              Llamar al {TELEFONO_TALLER}
            </a>
            <a
              href={`mailto:${CORREO_TALLER}?subject=${encodeURIComponent(`Consulta sobre mi cita #${seguimiento.idCita}`)}`}
              className="btn rounded-full border-neutral-content/20 bg-transparent text-neutral-content shadow-none hover:bg-neutral-content/10"
            >
              <FaEnvelope aria-hidden className="size-4" />
              Escribir un correo
            </a>
          </div>
        </section>
      </aside>
    </div>
  );
}

function PasoHito({ hito, ultimo }: { hito: Hito; ultimo: boolean }) {
  const completado = hito.estado === "completado";
  const actual = hito.estado === "actual";

  return (
    <li className="flex gap-4" aria-current={actual ? "step" : undefined}>
      <div className="flex flex-col items-center">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full border-2 ${
            completado
              ? "border-primary bg-primary text-neutral"
              : actual
                ? "border-primary bg-primary/15 text-secondary"
                : "border-base-300 bg-base-100 text-base-content/30"
          }`}
        >
          {completado ? (
            <FaCheck aria-hidden className="size-3.5" />
          ) : (
            <span className={`size-2.5 rounded-full ${actual ? "bg-primary" : "bg-base-300"}`} />
          )}
        </span>
        {!ultimo && <span className={`w-0.5 grow ${completado ? "bg-primary" : "bg-base-300"}`} />}
      </div>

      <div className={`min-w-0 ${ultimo ? "" : "pb-7"}`}>
        <p className={`font-semibold ${hito.estado === "pendiente" ? "text-base-content/40" : "text-secondary"}`}>
          {hito.titulo}
          {actual && (
            <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 align-middle text-xs font-medium text-secondary">
              Estado actual
            </span>
          )}
        </p>
        <p className={`text-sm ${hito.estado === "pendiente" ? "text-base-content/40" : "text-base-content/70"}`}>
          {hito.descripcion}
        </p>
        {hito.fecha && hito.estado !== "pendiente" && (
          <p className="mt-1 text-xs text-base-content/50">{hito.fecha}</p>
        )}
        <span className="sr-only">
          {completado ? "Completado" : actual ? "En curso" : "Pendiente"}
        </span>
      </div>
    </li>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary">{children}</dd>
    </div>
  );
}

export function SeguimientoCitaCargando() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Cargando el seguimiento">
      <CargandoPantalla texto="Cargando el seguimiento…" />
      <div className="flex flex-col gap-5 rounded-3xl border border-base-300 p-8 lg:col-span-2">
        <div className="skeleton h-6 w-1/2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton size-8 shrink-0 rounded-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <div className="skeleton h-48 w-full rounded-3xl" />
        <div className="skeleton h-40 w-full rounded-3xl" />
      </div>
    </div>
  );
}
