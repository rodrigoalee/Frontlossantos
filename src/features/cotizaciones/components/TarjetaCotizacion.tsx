import { formatearFechaCita, formatearMoneda } from "@/features/citas/formato";
import { PRESENTACION_ESTADO_COTIZACION } from "../formato";
import type { Cotizacion } from "../types";

export default function TarjetaCotizacion({ cotizacion, children }: { cotizacion: Cotizacion; children?: React.ReactNode }) {
  const estado = PRESENTACION_ESTADO_COTIZACION[cotizacion.estado];

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-base-300 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-secondary">Cotización #{cotizacion.idCotizacion}</h3>
          <p className="text-xs text-base-content/60">
            Enviada el {formatearFechaCita(cotizacion.fechaCreacion)}
            {cotizacion.fechaRespuesta && ` · respondida el ${formatearFechaCita(cotizacion.fechaRespuesta)}`}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${estado.insignia}`}>{estado.etiqueta}</span>
      </div>

      <ul className="flex flex-col divide-y divide-base-200">
        {cotizacion.lineas.map((linea, i) => (
          <li key={i} className="flex items-start justify-between gap-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="font-medium break-words">{linea.descripcion}</p>
              <p className="text-xs text-base-content/60">
                {linea.cantidad} × {formatearMoneda(linea.precioUnitario)}
              </p>
            </div>
            <span className="shrink-0 font-semibold">{formatearMoneda(linea.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between border-t border-base-300 pt-3">
        <span className="text-sm text-base-content/70">Total</span>
        <span className="text-lg font-bold text-secondary">{formatearMoneda(cotizacion.total)}</span>
      </div>

      {cotizacion.nota && <p className="rounded-xl bg-base-200/60 px-3 py-2 text-sm whitespace-pre-line">{cotizacion.nota}</p>}

      {children}
    </article>
  );
}
