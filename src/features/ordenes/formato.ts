import type { EstadoOrden } from "./types";

export const PRESENTACION_ESTADO_ORDEN: Record<EstadoOrden, { etiqueta: string; clases: string; insignia: string }> = {
  EnRecepcion: { etiqueta: "En recepción", clases: "text-amber-700", insignia: "bg-amber-100 text-amber-800" },
  EnProceso: { etiqueta: "En proceso", clases: "text-sky-700", insignia: "bg-sky-100 text-sky-800" },
  Finalizado: { etiqueta: "Finalizado", clases: "text-emerald-700", insignia: "bg-emerald-100 text-emerald-800" },
};

export function describirCarga(ordenesActivas: number) {
  if (ordenesActivas === 0) return "Disponible";
  return `Ocupado · ${ordenesActivas} ${ordenesActivas === 1 ? "orden activa" : "órdenes activas"}`;
}
