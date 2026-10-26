"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { NuevaLineaCotizacion, ResultadoAccion } from "./types";

function traducirError(error: unknown, contexto: string): { error: string } {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect("/login");
    if (error.status === 403) return { error: "Tu cuenta no tiene permiso para esta acción." };
    if (error.status === 404) return { error: "La cotización o la orden ya no existe." };
    if ((error.status === 400 || error.status === 409) && error.detalle) return { error: error.detalle };
    if (error.status === 400) return { error: "Revisa los datos e intenta de nuevo." };
  }
  console.error(`Error al ${contexto}:`, error);
  return { error: "No se pudo completar la acción. Intenta más tarde." };
}

export async function crearCotizacion(
  idOrden: number,
  nota: string,
  lineas: NuevaLineaCotizacion[],
): Promise<ResultadoAccion> {
  const limpias = lineas.map((linea) => ({ ...linea, descripcion: linea.descripcion.trim() }));
  if (limpias.length === 0) return { error: "Agrega al menos una línea." };
  if (limpias.some((l) => !l.descripcion || l.cantidad < 1 || l.precioUnitario < 0)) {
    return { error: "Cada línea necesita concepto, una cantidad de al menos 1 y un precio válido." };
  }

  try {
    await apiFetch<void>(`/api/ordenes/${idOrden}/cotizaciones`, {
      method: "POST",
      body: JSON.stringify({ nota: nota.trim() || null, lineas: limpias }),
    });
  } catch (error) {
    return traducirError(error, "crear la cotización");
  }
  refresh();
  return undefined;
}

export async function responderCotizacion(idCotizacion: number, aceptar: boolean): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/portal/cotizaciones/${idCotizacion}/respuesta`, {
      method: "POST",
      body: JSON.stringify({ aceptar }),
    });
  } catch (error) {
    return traducirError(error, "responder la cotización");
  }
  refresh();
  return undefined;
}
