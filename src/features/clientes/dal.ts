import "server-only";
import { apiFetch } from "@/lib/api";
import type { ClienteDetalle, ClienteResumen, ResultadoPaginado } from "./types";

const TAMANIO_MAXIMO = 100;

export async function obtenerTodosLosClientes() {
  const clientes: ClienteResumen[] = [];
  for (let pagina = 1; ; pagina++) {
    const parametros = new URLSearchParams({ pagina: String(pagina), tamanio: String(TAMANIO_MAXIMO) });
    const resultado = await apiFetch<ResultadoPaginado<ClienteResumen>>(`/api/clientes?${parametros}`);
    clientes.push(...resultado.items);
    if (resultado.items.length === 0 || clientes.length >= resultado.total) return clientes;
  }
}

export function obtenerCliente(idCliente: number) {
  return apiFetch<ClienteDetalle>(`/api/clientes/${idCliente}`);
}
