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

const formatoFechaCorta = new Intl.DateTimeFormat("es-GT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: ZONA_DEL_TALLER,
});

const formatoMoneda = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });

export function formatearHora(fechaHora: string) {
  return formatoHora.format(new Date(fechaHora));
}

export function formatearFechaCorta(fechaHora: string) {
  return formatoFechaCorta.format(new Date(fechaHora));
}

export function formatearMoneda(monto: number) {
  return formatoMoneda.format(monto);
}

export function formatearFechaCita(fechaHora: string) {
  const fecha = new Date(fechaHora);
  return `${formatoFecha.format(fecha)} a las ${formatoHora.format(fecha)}`;
}

export const PRESENTACION_ESTADO: Record<EstadoCita, { etiqueta: string; clases: string }> = {
  Pendiente: { etiqueta: "Programada", clases: "text-amber-700" },
  Confirmada: { etiqueta: "Confirmada", clases: "text-emerald-700" },
  Cancelada: { etiqueta: "Cancelada", clases: "text-red-700" },
};
