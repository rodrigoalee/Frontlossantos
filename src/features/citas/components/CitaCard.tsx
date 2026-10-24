import Link from "next/link";
import { FaCalendarDays } from "react-icons/fa6";
import { formatearFechaCita, PRESENTACION_ESTADO } from "../formato";
import type { CitaPortal } from "../types";

export default function CitaCard({ cita }: { cita: CitaPortal }) {
  const estado = PRESENTACION_ESTADO[cita.estado];

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/15 text-secondary">
            <FaCalendarDays aria-hidden className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold break-words text-secondary">
              {cita.motivo?.trim() || "Cita en el taller"}
            </h2>
            <p className="text-sm text-base-content/70">
              {cita.marca} {cita.modelo} {cita.anio}
              <span className="ml-2 font-mono text-xs tracking-wide text-base-content/50">{cita.placa}</span>
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${estado.clases}`}>
          {estado.badge}
        </span>
      </div>

      <p className="text-sm">{formatearFechaCita(cita.fechaHora)}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-4">
        <p className="text-sm text-base-content/60">Estado: {estado.detalle}</p>
        <Link
          href={`/panel/citas/${cita.idCita}`}
          className="btn btn-sm rounded-full border-none bg-primary/10 px-5 font-semibold text-secondary shadow-none hover:bg-primary hover:text-primary-content"
        >
          Ver seguimiento
        </Link>
      </div>
    </article>
  );
}
