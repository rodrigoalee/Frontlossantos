import "server-only";
import type { CitaTaller } from "@/features/citas/types";
import { apiFetch } from "@/lib/api";
import { todasLasPaginas } from "@/lib/paginacion";
import type {
  EstadoOrden,
  MecanicoDisponible,
  OrdenDetalle,
  OrdenLista,
  RepuestoInventario,
  ServicioCatalogo,
} from "./types";

export function obtenerOrdenes(filtros: { estado?: EstadoOrden; busqueda?: string; asignadasAMi?: boolean } = {}) {
  return todasLasPaginas<OrdenLista>("/api/ordenes", {
    ...(filtros.estado && { estado: filtros.estado }),
    ...(filtros.busqueda && { busqueda: filtros.busqueda }),
    ...(filtros.asignadasAMi && { asignadasAMi: "true" }),
  });
}

export function obtenerOrden(idOrden: number) {
  return apiFetch<OrdenDetalle>(`/api/ordenes/${idOrden}`);
}

export function obtenerMecanicos(sucursalId: number) {
  return apiFetch<MecanicoDisponible[]>(`/api/ordenes/mecanicos?sucursalId=${sucursalId}`);
}

export function obtenerCitasSinOrden(desde: Date, hasta: Date) {
  return todasLasPaginas<CitaTaller>("/api/citas", {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
    sinOrden: "true",
  });
}

export function obtenerInventario(sucursalId: number) {
  return todasLasPaginas<RepuestoInventario>(`/api/sucursales/${sucursalId}/inventario`);
}

export async function obtenerServiciosActivos() {
  const servicios = await todasLasPaginas<ServicioCatalogo>("/api/servicios");
  return servicios.filter((servicio) => servicio.activo);
}
