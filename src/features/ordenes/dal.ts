import "server-only";
import type { CitaTaller } from "@/features/citas/types";
import type { ResultadoPaginado } from "@/features/clientes/types";
import { apiFetch } from "@/lib/api";
import type {
  EstadoOrden,
  MecanicoDisponible,
  OrdenDetalle,
  OrdenLista,
  RepuestoInventario,
  ServicioCatalogo,
} from "./types";

const TAMANIO_MAXIMO = 100;

async function todasLasPaginas<T>(ruta: string, filtros: Record<string, string> = {}) {
  const items: T[] = [];
  for (let pagina = 1; ; pagina++) {
    const parametros = new URLSearchParams({ ...filtros, pagina: String(pagina), tamanio: String(TAMANIO_MAXIMO) });
    const resultado = await apiFetch<ResultadoPaginado<T>>(`${ruta}?${parametros}`);
    items.push(...resultado.items);
    if (resultado.items.length === 0 || items.length >= resultado.total) return items;
  }
}

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
