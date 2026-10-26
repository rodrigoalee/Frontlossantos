import "server-only";
import { apiFetch } from "@/lib/api";
import type { ResultadoPaginado } from "@/features/clientes/types";
import type {
  CitaPortal,
  CitaTaller,
  CitaTallerDetalle,
  DiaDisponibilidad,
  NuevaCita,
  SeguimientoCita,
  Servicio,
  Sucursal,
} from "./types";

const TAMANIO_MAXIMO = 100;

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

export async function obtenerCitasDelTaller() {
  const citas: CitaTaller[] = [];
  for (let pagina = 1; ; pagina++) {
    const parametros = new URLSearchParams({ pagina: String(pagina), tamanio: String(TAMANIO_MAXIMO) });
    const resultado = await apiFetch<ResultadoPaginado<CitaTaller>>(`/api/citas?${parametros}`);
    citas.push(...resultado.items);
    if (resultado.items.length === 0 || citas.length >= resultado.total) return citas;
  }
}

export function obtenerCitaDelTaller(idCita: number) {
  return apiFetch<CitaTallerDetalle>(`/api/citas/${idCita}`);
}
