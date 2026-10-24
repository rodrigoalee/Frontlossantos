import type { EstadoCita } from "./types";

const ZONA_DEL_TALLER = "America/Guatemala";

const formatoFecha = new Intl.DateTimeFormat("es-GT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: ZONA_DEL_TALLER,
});

const formatoHora = new Intl.DateTimeFormat("es-GT", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: ZONA_DEL_TALLER,
});

export function formatearFechaCita(fechaHora: string) {
  const fecha = new Date(fechaHora);
  return `${formatoFecha.format(fecha)} a las ${formatoHora.format(fecha)}`;
}

export const PRESENTACION_ESTADO: Record<EstadoCita, { badge: string; detalle: string; clases: string }> = {
  Pendiente: {
    badge: "Programada",
    detalle: "Cita agendada",
    clases: "bg-amber-100 text-amber-800",
  },
  Confirmada: {
    badge: "Confirmada",
    detalle: "Confirmada por el taller",
    clases: "bg-emerald-100 text-emerald-800",
  },
  Cancelada: {
    badge: "Cancelada",
    detalle: "Cita cancelada",
    clases: "bg-red-100 text-red-800",
  },
};
