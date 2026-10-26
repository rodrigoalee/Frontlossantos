"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { obtenerServicio, obtenerTodosLosServicios } from "./dal";
import type { AccionServicioState, ServicioState } from "./types";

const TARIFA_MAXIMA = 9_999_999.99;
const DOS_DECIMALES = /^\d+(\.\d{1,2})?$/;

type ServicioLeido = {
  error?: string;
  valores: Record<string, string>;
  cuerpo?: { nombre: string; tarifaManoObra: number };
};

function normalizarNombre(nombre: string) {
  return nombre.trim().replace(/\s+/g, " ");
}

function leerServicio(formData: FormData): ServicioLeido {
  const valores = {
    nombre: normalizarNombre(String(formData.get("nombre") ?? "")),
    tarifaManoObra: String(formData.get("tarifaManoObra") ?? "").replace(/[\s,]/g, ""),
  };
  const tarifa = Number(valores.tarifaManoObra);

  if (!valores.nombre || !valores.tarifaManoObra) {
    return { error: "Completa el nombre y la tarifa.", valores };
  }
  if (!DOS_DECIMALES.test(valores.tarifaManoObra) || tarifa > TARIFA_MAXIMA) {
    return { error: "La tarifa debe ser un monto entre Q0.00 y Q9,999,999.99, con hasta dos decimales.", valores };
  }
  return { valores, cuerpo: { nombre: valores.nombre, tarifaManoObra: tarifa } };
}

async function nombreRepetido(nombre: string, idPropio?: number) {
  const coincidencias = await obtenerTodosLosServicios(nombre);
  const buscado = nombre.toLocaleLowerCase("es");
  return coincidencias.some(
    (servicio) =>
      servicio.idServicio !== idPropio && normalizarNombre(servicio.nombre).toLocaleLowerCase("es") === buscado,
  );
}

function mensajeComun(error: unknown, permiso: string): string | undefined {
  if (error instanceof ApiError && error.status === 401) redirect("/login");
  if (error instanceof ApiError && error.status === 403) return `Tu cuenta no tiene permiso para ${permiso}.`;
  if (error instanceof ApiError && error.status === 404) return "Este servicio ya no existe.";
  if (error instanceof ApiError && error.status === 409) {
    return error.detalle ?? "Otra persona modificó este servicio. Recarga la página e intenta de nuevo.";
  }
  return undefined;
}

export async function crearServicio(_prev: ServicioState, formData: FormData): Promise<ServicioState> {
  const { error, valores, cuerpo } = leerServicio(formData);
  if (!cuerpo) return { error, valores };

  try {
    if (await nombreRepetido(cuerpo.nombre)) {
      return { error: `Ya hay un servicio llamado "${cuerpo.nombre}".`, valores };
    }
    await apiFetch<void>("/api/servicios", { method: "POST", body: JSON.stringify(cuerpo) });
  } catch (error) {
    const mensaje = mensajeComun(error, "registrar servicios");
    if (mensaje) return { error: mensaje, valores };
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del servicio e intenta de nuevo.", valores };
    }
    console.error("Error al registrar servicio:", error);
    return { error: "No se pudo registrar el servicio. Intenta más tarde.", valores };
  }

  redirect("/admin/servicios");
}

export async function actualizarServicio(
  idServicio: number,
  activo: boolean,
  _prev: ServicioState,
  formData: FormData,
): Promise<ServicioState> {
  const { error, valores, cuerpo } = leerServicio(formData);
  if (!cuerpo) return { error, valores };

  try {
    if (await nombreRepetido(cuerpo.nombre, idServicio)) {
      return { error: `Ya hay otro servicio llamado "${cuerpo.nombre}".`, valores };
    }
    await apiFetch<void>(`/api/servicios/${idServicio}`, {
      method: "PUT",
      body: JSON.stringify({ ...cuerpo, activo }),
    });
  } catch (error) {
    const mensaje = mensajeComun(error, "editar servicios");
    if (mensaje) return { error: mensaje, valores };
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del servicio e intenta de nuevo.", valores };
    }
    console.error("Error al actualizar servicio:", error);
    return { error: "No se pudo guardar el servicio. Intenta más tarde.", valores };
  }

  refresh();
  return { ok: true };
}

export async function darDeBajaServicio(idServicio: number): Promise<AccionServicioState> {
  try {
    await apiFetch<void>(`/api/servicios/${idServicio}`, { method: "DELETE" });
  } catch (error) {
    const mensaje = mensajeComun(error, "dar de baja servicios");
    if (mensaje) return { error: mensaje };
    console.error("Error al dar de baja servicio:", error);
    return { error: "No se pudo dar de baja el servicio. Intenta más tarde." };
  }

  refresh();
  return undefined;
}

export async function reactivarServicio(idServicio: number): Promise<AccionServicioState> {
  try {
    const { nombre, tarifaManoObra } = await obtenerServicio(idServicio);
    await apiFetch<void>(`/api/servicios/${idServicio}`, {
      method: "PUT",
      body: JSON.stringify({ nombre, tarifaManoObra, activo: true }),
    });
  } catch (error) {
    const mensaje = mensajeComun(error, "reactivar servicios");
    if (mensaje) return { error: mensaje };
    console.error("Error al reactivar servicio:", error);
    return { error: "No se pudo reactivar el servicio. Intenta más tarde." };
  }

  refresh();
  return undefined;
}
