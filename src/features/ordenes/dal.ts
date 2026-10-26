import "server-only";
import type { CitaTaller } from "@/features/citas/types";
import type { ResultadoPaginado } from "@/features/clientes/types";
import { apiFetch } from "@/lib/api";
import { todasLasPaginas } from "@/lib/paginacion";
import type {
  ConteoOrdenesPorEstado,
  EstadoOrden,
  MecanicoDisponible,
  OrdenDetalle,
  OrdenLista,
  RepuestoInventario,
  ServicioCatalogo,
} from "./types";

export function obtenerOrdenes(filtros: { estado?: EstadoOrden; busqueda?: string } = {}) {
  return todasLasPaginas<OrdenLista>("/api/ordenes", {
    ...(filtros.estado && { estado: filtros.estado }),
    ...(filtros.busqueda && { busqueda: filtros.busqueda }),
  });
}

export const TAMANIO_PAGINA_MIS_ORDENES = 10;

export function obtenerMisOrdenes(estado: EstadoOrden, busqueda: string, pagina: number) {
  const parametros = new URLSearchParams({
    asignadasAMi: "true",
    estado,
    pagina: String(pagina),
    tamanio: String(TAMANIO_PAGINA_MIS_ORDENES),
  });
  if (busqueda) parametros.set("busqueda", busqueda);
  return apiFetch<ResultadoPaginado<OrdenLista>>(`/api/ordenes?${parametros}`);
}

export function contarMisOrdenes(busqueda: string) {
  const parametros = new URLSearchParams({ asignadasAMi: "true" });
  if (busqueda) parametros.set("busqueda", busqueda);
  return apiFetch<ConteoOrdenesPorEstado>(`/api/ordenes/conteo-por-estado?${parametros}`);
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
