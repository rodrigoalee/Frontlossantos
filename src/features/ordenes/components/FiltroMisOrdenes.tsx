import Link from "next/link";
import { FILTROS_MIS_ORDENES, type FiltroMisOrdenes as Filtro } from "../filtros";
import type { ConteoOrdenesPorEstado, EstadoOrden } from "../types";

const CLAVE_CONTEO: Record<EstadoOrden, keyof ConteoOrdenesPorEstado> = {
  EnRecepcion: "enRecepcion",
  EnProceso: "enProceso",
  Finalizado: "finalizado",
};

export default function FiltroMisOrdenes({
  actual,
  conteos,
  busqueda,
}: {
  actual: Filtro["valor"];
  conteos: ConteoOrdenesPorEstado;
  busqueda: string;
}) {
  return (
    <nav aria-label="Filtrar mis órdenes por estado" className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {FILTROS_MIS_ORDENES.map((filtro) => {
        const activo = filtro.valor === actual;
        const total = conteos[CLAVE_CONTEO[filtro.estado]];
        const parametros = new URLSearchParams({ estado: filtro.valor });
        if (busqueda) parametros.set("q", busqueda);

        return (
          <Link
            key={filtro.valor}
            href={`/admin/ordenes?${parametros}`}
            aria-current={activo ? "page" : undefined}
            aria-label={`${filtro.etiqueta}, ${total} ${total === 1 ? "orden" : "órdenes"}`}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center text-sm leading-tight font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-12 sm:flex-row sm:gap-2 sm:text-base ${
              activo ? "bg-secondary text-secondary-content" : "bg-base-200 text-secondary hover:bg-base-300"
            }`}
          >
            {filtro.etiqueta}
            <span
              className={`min-w-6 rounded-full px-2 text-xs leading-5 sm:text-sm ${
                activo ? "bg-secondary-content/20" : "bg-base-100 text-base-content/70"
              }`}
            >
              {total}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
