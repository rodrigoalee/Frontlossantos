import "server-only";
import type { ResultadoPaginado } from "@/features/clientes/types";
import { apiFetch } from "@/lib/api";
import type { FacturaDeOrden, ResumenPago } from "./types";

export function obtenerResumenPago(token: string) {
  return apiFetch<ResumenPago>(`/api/pasarela/${encodeURIComponent(token)}`);
}

export async function obtenerFacturaDeOrden(idOrden: number) {
  const { items } = await apiFetch<ResultadoPaginado<FacturaDeOrden>>(`/api/facturas?ordenTrabajoId=${idOrden}&tamanio=1`);
  return items[0];
}
