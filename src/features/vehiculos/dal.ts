import "server-only";
import type { ResultadoPaginado } from "@/features/clientes/types";
import { apiFetch } from "@/lib/api";
import type { Vehiculo, VehiculoLista } from "./types";

const TAMANIO_MAXIMO = 100;

export function obtenerMisVehiculos() {
  return apiFetch<Vehiculo[]>("/api/portal/vehiculos");
}

export async function obtenerTodosLosVehiculos() {
  const vehiculos: VehiculoLista[] = [];
  for (let pagina = 1; ; pagina++) {
    const parametros = new URLSearchParams({ pagina: String(pagina), tamanio: String(TAMANIO_MAXIMO) });
    const resultado = await apiFetch<ResultadoPaginado<VehiculoLista>>(`/api/vehiculos?${parametros}`);
    vehiculos.push(...resultado.items);
    if (resultado.items.length === 0 || vehiculos.length >= resultado.total) return vehiculos;
  }
}
