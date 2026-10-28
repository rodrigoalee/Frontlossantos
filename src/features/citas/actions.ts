"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { crearCita, obtenerDisponibilidad } from "./dal";
import { MINIMO_DESCRIPCION } from "./formato";
import type { CambiarEstadoCitaState, DiaDisponibilidad, EstadoCita, NuevaCita } from "./types";

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export async function consultarDisponibilidad(
  sucursalId: number,
  desde: string,
  hasta: string,
): Promise<{ dias: DiaDisponibilidad[] } | { error: string }> {
  if (!Number.isInteger(sucursalId) || sucursalId < 1 || !FECHA.test(desde) || !FECHA.test(hasta)) {
    return { error: "Elige una sede válida." };
  }

  try {
    return { dias: await obtenerDisponibilidad(sucursalId, desde, hasta) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 400 && error.detalle) return { error: error.detalle };
    console.error("Error al consultar disponibilidad:", error);
    return { error: "No se pudo cargar la disponibilidad." };
  }
}

export async function agendarCita(datos: NuevaCita): Promise<{ error: string } | undefined> {
  if (datos.servicioId === null && (datos.descripcionServicio?.trim().length ?? 0) < MINIMO_DESCRIPCION) {
    return { error: `Describe lo que necesitas con al menos ${MINIMO_DESCRIPCION} caracteres.` };
  }

  try {
    await crearCita(datos);
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("Error al agendar cita:", error);
      return { error: "No se pudo conectar con el servidor. Intenta más tarde." };
    }
    if (error.status === 401) redirect("/login");
    if (error.status === 404) return { error: "Elige uno de tus vehículos registrados." };
    if ((error.status === 400 || error.status === 409) && error.detalle) return { error: error.detalle };
    return { error: "No se pudo agendar la cita. Revisa los datos e intenta de nuevo." };
  }

  redirect("/panel");
}

export async function cambiarEstadoCita(idCita: number, estado: EstadoCita): Promise<CambiarEstadoCitaState> {
  try {
    await apiFetch<void>(`/api/citas/${idCita}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return { error: "Tu cuenta no tiene permiso para cambiar el estado de las citas." };
    }
    if (error instanceof ApiError && error.status === 404) {
      return { error: "Esta cita ya no existe." };
    }
    if (error instanceof ApiError && error.status === 409 && error.detalle) return { error: error.detalle };
    console.error("Error al cambiar el estado de la cita:", error);
    return { error: "No se pudo actualizar la cita. Intenta más tarde." };
  }

  refresh();
  return undefined;
}

export async function cancelarMiCita(idCita: number): Promise<CambiarEstadoCitaState> {
  try {
    await apiFetch<void>(`/api/portal/citas/${idCita}/cancelar`, { method: "POST" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) return { error: "Esta cita ya no existe." };
    if (error instanceof ApiError && error.status === 409 && error.detalle) return { error: error.detalle };
    console.error("Error al cancelar la cita:", error);
    return { error: "No se pudo cancelar la cita. Intenta más tarde." };
  }

  refresh();
  return undefined;
}
