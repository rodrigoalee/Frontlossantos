"use server";

import { del, put } from "@vercel/blob";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { verificarSesion } from "@/features/auth/dal";
import { ApiError, apiFetch } from "@/lib/api";
import { TAMANO_MAXIMO_FOTO } from "@/lib/comprimirFoto";
import type { EstadoOrden, NuevaLinea, ResultadoAccion } from "./types";

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

export async function abrirOrden(citaId: number, motivoIngreso: string | null): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>("/api/ordenes", {
      method: "POST",
      body: JSON.stringify({ citaId, mecanicoAsignadoId: null, motivoIngreso }),
    });
  } catch (error) {
    return traducirError(error, "recibir el vehículo");
  }
  refresh();
  return undefined;
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

/**
 * El archivo va a Vercel Blob y la API solo guarda su URL. Si la API la rechaza, se borra del Blob
 * para no dejar fotos huérfanas.
 */
export async function subirFotoOrden(idOrden: number, datos: FormData): Promise<ResultadoAccion> {
  // La API vuelve a revisar el permiso, pero así nadie sin acceso llena el almacenamiento.
  const usuario = await verificarSesion();
  if (!usuario.permisos?.includes("ordenes.editar")) return { error: "Tu cuenta no tiene permiso para esta acción." };

  const foto = datos.get("foto");
  const descripcion = String(datos.get("descripcion") ?? "").trim().slice(0, 200) || null;
  if (!(foto instanceof File) || foto.type !== "image/jpeg" || foto.size > TAMANO_MAXIMO_FOTO) {
    return { error: "La foto no es válida. Vuelve a tomarla." };
  }

  let url: string;
  try {
    ({ url } = await put(`ordenes/${idOrden}/foto.jpg`, foto, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/jpeg",
    }));
  } catch (error) {
    console.error("Error al guardar la foto en Vercel Blob:", error);
    return { error: "No se pudo guardar la foto. Intenta más tarde." };
  }

  try {
    await apiFetch<void>(`/api/ordenes/${idOrden}/fotos`, {
      method: "POST",
      body: JSON.stringify({ url, descripcion }),
    });
  } catch (error) {
    await del(url).catch((errorBorrado) => console.error("No se pudo borrar la foto rechazada:", errorBorrado));
    return traducirError(error, "registrar la foto");
  }
  refresh();
  return undefined;
}

export async function quitarFotoOrden(idOrden: number, idFoto: number): Promise<ResultadoAccion> {
  let url: string;
  try {
    // La URL a borrar la da la API, no el navegador: así no se puede borrar un archivo ajeno.
    ({ url } = await apiFetch<{ url: string }>(`/api/ordenes/${idOrden}/fotos/${idFoto}`, { method: "DELETE" }));
  } catch (error) {
    return traducirError(error, "quitar la foto");
  }
  // Ya no está en la orden; si el Blob falla solo queda un archivo sin enlazar que nadie ve.
  await del(url).catch((error) => console.error("No se pudo borrar la foto de Vercel Blob:", error));
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
