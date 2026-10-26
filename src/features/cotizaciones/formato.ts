import type { EstadoCotizacion } from "./types";

export const PRESENTACION_ESTADO_COTIZACION: Record<EstadoCotizacion, { etiqueta: string; insignia: string }> = {
  Pendiente: { etiqueta: "Esperando respuesta", insignia: "bg-amber-100 text-amber-800" },
  Aceptada: { etiqueta: "Aceptada", insignia: "bg-emerald-100 text-emerald-800" },
  Rechazada: { etiqueta: "Rechazada", insignia: "bg-base-300 text-base-content/70" },
};
