import "server-only";
import { apiFetch } from "@/lib/api";
import type { CitaPortal, DiaDisponibilidad, NuevaCita, SeguimientoCita, Servicio, Sucursal } from "./types";

export function obtenerMisCitas() {
  return apiFetch<CitaPortal[]>("/api/portal/citas");
}

export function obtenerSeguimiento(idCita: number) {
  return apiFetch<SeguimientoCita>(`/api/portal/citas/${idCita}/seguimiento`);
}

export function obtenerSucursales() {
  return apiFetch<Sucursal[]>("/api/portal/sucursales");
}

export function obtenerServicios() {
  return apiFetch<Servicio[]>("/api/portal/servicios");
}

export function obtenerDisponibilidad(sucursalId: number, desde: string, hasta: string) {
  const parametros = new URLSearchParams({ sucursalId: String(sucursalId), desde, hasta });
  return apiFetch<DiaDisponibilidad[]>(`/api/portal/disponibilidad?${parametros}`);
}

export async function crearCita(datos: NuevaCita) {
  const { idCita } = await apiFetch<{ idCita: number }>("/api/portal/citas", {
    method: "POST",
    body: JSON.stringify(datos),
  });
  return idCita;
}
