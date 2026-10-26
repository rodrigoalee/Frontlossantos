import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import { formatearFechaCorta, formatearHora, formatearMoneda } from "@/features/citas/formato";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { PRESENTACION_ESTADO_ORDEN } from "../formato";
import type { OrdenLista } from "../types";

export default function OrdenCard({ orden, conMecanico = true }: { orden: OrdenLista; conMecanico?: boolean }) {
  const estado = PRESENTACION_ESTADO_ORDEN[orden.estado];

  return (
    <Link
      href={`/admin/ordenes/${orden.idOrdenEncabezado}`}
      aria-label={`Ver la orden ${orden.idOrdenEncabezado} de ${orden.nombreCliente}, ${estado.etiqueta.toLowerCase()}`}
      className="group flex min-w-0 grow items-center gap-4 rounded-3xl bg-base-200/40 px-5 py-4 transition-colors hover:bg-base-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-7 sm:py-5"
    >
      <div className="flex min-w-0 grow flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 text-lg font-semibold break-words text-secondary sm:text-xl">
            #{orden.idOrdenEncabezado} · {formatearPlaca(orden.placa)}
          </h3>
          <span className="shrink-0 font-semibold text-base-content">{formatearMoneda(orden.totalEstimado)}</span>
        </div>
        <p className="text-sm text-base-content/60 sm:text-base">
          {orden.nombreCliente}
          {orden.servicio && ` · ${orden.servicio}`}
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm sm:text-base">
          <p className="text-base-content/60">
            Estado <span className={`ml-1.5 font-semibold ${estado.clases}`}>{estado.etiqueta}</span>
          </p>
          {conMecanico && (
            <p className="text-base-content/60">
              Mecánico{" "}
              <span className="ml-1.5 font-semibold text-base-content">{orden.mecanicoAsignado ?? "Sin asignar"}</span>
            </p>
          )}
          <p className="text-base-content/60">
            Ingreso{" "}
            <span className="ml-1.5 font-semibold text-base-content">
              {formatearFechaCorta(orden.fechaIngreso)} {formatearHora(orden.fechaIngreso)}
            </span>
          </p>
        </div>
      </div>
      <FaChevronRight
        aria-hidden
        className="size-4 shrink-0 text-base-content/30 transition-transform group-hover:translate-x-0.5 group-hover:text-secondary"
      />
    </Link>
  );
}
