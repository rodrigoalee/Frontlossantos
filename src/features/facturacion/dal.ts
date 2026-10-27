import "server-only";
import { apiFetch } from "@/lib/api";
import { todasLasPaginas } from "@/lib/paginacion";
import type { FacturaDetalle, FacturaLista, FacturaPortal } from "./types";

export function obtenerFacturas() {
  return todasLasPaginas<FacturaLista>("/api/facturas");
}

export function obtenerFactura(idFactura: number) {
  return apiFetch<FacturaDetalle>(`/api/facturas/${idFactura}`);
}

export function obtenerMisFacturas() {
  return apiFetch<FacturaPortal[]>("/api/portal/facturas");
}
