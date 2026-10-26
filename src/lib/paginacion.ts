import "server-only";
import type { ResultadoPaginado } from "@/features/clientes/types";
import { apiFetch } from "./api";

const TAMANIO_MAXIMO = 100;

export async function todasLasPaginas<T>(ruta: string, filtros: Record<string, string> = {}) {
  const items: T[] = [];
  for (let pagina = 1; ; pagina++) {
    const parametros = new URLSearchParams({ ...filtros, pagina: String(pagina), tamanio: String(TAMANIO_MAXIMO) });
    const resultado = await apiFetch<ResultadoPaginado<T>>(`${ruta}?${parametros}`);
    items.push(...resultado.items);
    if (resultado.items.length === 0 || items.length >= resultado.total) return items;
  }
}
