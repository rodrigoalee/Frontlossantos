import "server-only";
import { apiFetch } from "@/lib/api";
import { todasLasPaginas } from "@/lib/paginacion";
import type { ServicioCatalogo } from "./types";

export function obtenerTodosLosServicios(busqueda?: string) {
  return todasLasPaginas<ServicioCatalogo>("/api/servicios", {
    soloActivos: "false",
    ...(busqueda && { busqueda }),
  });
}

export function obtenerServicio(idServicio: number) {
  return apiFetch<ServicioCatalogo>(`/api/servicios/${idServicio}`);
}
