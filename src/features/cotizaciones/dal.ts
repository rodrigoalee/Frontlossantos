import "server-only";
import { apiFetch } from "@/lib/api";
import type { Cotizacion } from "./types";

export function obtenerCotizacionesDeOrden(idOrden: number) {
  return apiFetch<Cotizacion[]>(`/api/ordenes/${idOrden}/cotizaciones`);
}

export function obtenerCotizacionesDeCita(idCita: number) {
  return apiFetch<Cotizacion[]>(`/api/portal/citas/${idCita}/cotizaciones`);
}
