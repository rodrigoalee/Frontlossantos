"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { CitaTallerDetalle } from "@/features/citas/types";
import { ApiError, apiFetch } from "@/lib/api";
import type { EstadoOrden, NuevaLinea, NuevaOrden, ResultadoAccion } from "./types";

function traducirError(error: unknown, contexto: string): { error: string } {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect("/login");
    if (error.status === 403) return { error: error.detalle ?? "Tu cuenta no tiene permiso para esta acción." };
    if (error.status === 404) return { error: "Esta orden ya no existe o no está asignada a ti." };
    if ((error.status === 400 || error.status === 409) && error.detalle) return { error: error.detalle };
  }
  console.error(`Error al ${contexto}:`, error);
  return { error: "No se pudo completar la acción. Intenta más tarde." };
}

export async function abrirOrden(datos: NuevaOrden): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>("/api/ordenes", { method: "POST", body: JSON.stringify(datos) });
  } catch (error) {
    return traducirError(error, "abrir la orden");
  }

  const cita = await apiFetch<CitaTallerDetalle>(`/api/citas/${datos.citaId}`).catch(() => undefined);
  redirect(cita?.idOrden ? `/admin/ordenes/${cita.idOrden}` : "/admin/ordenes");
}

export async function cambiarEstadoOrden(idOrden: number, estado: EstadoOrden): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/ordenes/${idOrden}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) });
  } catch (error) {
    return traducirError(error, "cambiar el estado de la orden");
  }
  refresh();
  return undefined;
}

export async function guardarDiagnostico(idOrden: number, diagnostico: string): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/ordenes/${idOrden}/diagnostico`, {
      method: "PATCH",
      body: JSON.stringify({ diagnostico: diagnostico.trim() || null }),
    });
  } catch (error) {
    return traducirError(error, "guardar el diagnóstico");
  }
  refresh();
  return undefined;
}

export async function cambiarMecanico(
  idOrden: number,
  mecanicoAsignadoId: number | null,
  diagnostico: string | null,
): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/ordenes/${idOrden}`, {
      method: "PUT",
      body: JSON.stringify({ mecanicoAsignadoId, diagnostico }),
    });
  } catch (error) {
    return traducirError(error, "cambiar el mecánico");
  }
  refresh();
  return undefined;
}

export async function agregarLinea(idOrden: number, linea: NuevaLinea): Promise<ResultadoAccion> {
  if (!Number.isInteger(linea.cantidad) || linea.cantidad < 1) return { error: "La cantidad debe ser al menos 1." };
  try {
    await apiFetch<void>(`/api/ordenes/${idOrden}/lineas`, { method: "POST", body: JSON.stringify(linea) });
  } catch (error) {
    return traducirError(error, "agregar la línea");
  }
  refresh();
  return undefined;
}

export async function quitarLinea(idOrden: number, idLinea: number): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/ordenes/${idOrden}/lineas/${idLinea}`, { method: "DELETE" });
  } catch (error) {
    return traducirError(error, "quitar la línea");
  }
  refresh();
  return undefined;
}
