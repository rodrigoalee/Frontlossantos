import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { formatearFechaCorta, formatearHora, PRESENTACION_ESTADO } from "../formato";
import type { CitaPortal } from "../types";

export default function CitaCard({ cita }: { cita: CitaPortal }) {
  const estado = PRESENTACION_ESTADO[cita.estado];
  const titulo = cita.servicio ?? (cita.motivo?.trim() || "Cita en el taller");

  return (
    <Link
      href={`/panel/citas/${cita.idCita}`}
      aria-label={`Ver seguimiento de ${titulo}, ${estado.etiqueta.toLowerCase()}`}
      className="group flex items-center gap-4 rounded-3xl bg-base-200/40 px-5 py-4 transition-colors hover:bg-base-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-7 sm:py-5"
    >
      <div className="flex min-w-0 grow flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 text-lg font-semibold break-words text-secondary sm:text-xl">{titulo}</h2>
          <time dateTime={cita.fechaHora} className="shrink-0 text-sm text-base-content/60 sm:text-base">
            {formatearFechaCorta(cita.fechaHora)}
          </time>
        </div>
        <p className="text-sm text-base-content/60 sm:text-base">
          {cita.marca} {cita.modelo} {cita.anio} · {formatearPlaca(cita.placa)}
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm sm:text-base">
          <p className="text-base-content/60">
            Estado <span className={`ml-1.5 font-semibold ${estado.clases}`}>{estado.etiqueta}</span>
          </p>
          <p className="text-base-content/60">
            Hora <span className="ml-1.5 font-semibold text-base-content">{formatearHora(cita.fechaHora)}</span>
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
