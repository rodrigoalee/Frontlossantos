import "server-only";
import type { Sucursal } from "@/features/citas/types";
import type { RepuestoInventario } from "@/features/ordenes/types";
import { ApiError, apiFetch } from "@/lib/api";
import { todasLasPaginas } from "@/lib/paginacion";
import type { ExistenciaSede, Repuesto } from "./types";

export function obtenerTodosLosRepuestos() {
  return todasLasPaginas<Repuesto>("/api/repuestos", { soloActivos: "false" });
}

export function obtenerRepuesto(idRepuesto: number) {
  return apiFetch<Repuesto>(`/api/repuestos/${idRepuesto}`);
}

async function existenciaEnSede(sede: Sucursal, repuesto: Repuesto): Promise<ExistenciaSede | null> {
  try {
    const inventario = await todasLasPaginas<RepuestoInventario>(`/api/sucursales/${sede.idSucursal}/inventario`, {
      busqueda: repuesto.codigoStock,
    });
    const fila = inventario.find((item) => item.repuestoId === repuesto.idRepuesto);
    return { idSucursal: sede.idSucursal, sede: sede.nombre, cantidad: fila?.cantidad ?? 0 };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) return null;
    throw error;
  }
}

export async function obtenerExistencias(repuesto: Repuesto) {
  const sedes = await apiFetch<Sucursal[]>("/api/portal/sucursales");
  const existencias = await Promise.all(sedes.map((sede) => existenciaEnSede(sede, repuesto)));
  return existencias.filter((existencia) => existencia !== null);
}
