"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { AccionRepuestoState, Repuesto, RepuestoState } from "./types";

const PRECIO_MAXIMO = 9_999_999.99;
const CANTIDAD_MAXIMA = 2_147_483_647;
const DOS_DECIMALES = /^\d+(\.\d{1,2})?$/;

type RepuestoLeido = {
  error?: string;
  valores: Record<string, string>;
  cuerpo?: { codigoStock: string; nombre: string; precioUnitario: number };
};

function leerRepuesto(formData: FormData): RepuestoLeido {
  const valores = {
    codigoStock: String(formData.get("codigoStock") ?? "").trim().toUpperCase(),
    nombre: String(formData.get("nombre") ?? "").trim(),
    precioUnitario: String(formData.get("precioUnitario") ?? "").replace(/[\s,]/g, ""),
  };
  const precio = Number(valores.precioUnitario);

  if (!valores.codigoStock || !valores.nombre || !valores.precioUnitario) {
    return { error: "Completa el código, el nombre y el precio.", valores };
  }
  if (!DOS_DECIMALES.test(valores.precioUnitario) || precio > PRECIO_MAXIMO) {
    return { error: "El precio debe ser un monto entre Q0.00 y Q9,999,999.99, con hasta dos decimales.", valores };
  }
  return { valores, cuerpo: { codigoStock: valores.codigoStock, nombre: valores.nombre, precioUnitario: precio } };
}

function mensajeComun(error: unknown, permiso: string, codigoStock?: string): string | undefined {
  if (error instanceof ApiError && error.status === 401) redirect("/login");
  if (error instanceof ApiError && error.status === 403) return `Tu cuenta no tiene permiso para ${permiso}.`;
  if (error instanceof ApiError && error.status === 404) return "Este repuesto ya no existe.";
  if (error instanceof ApiError && error.status === 409) {
    return !error.detalle || error.detalle.startsWith("Ya existe un registro")
      ? `Ya hay un repuesto con ${codigoStock ? `el código ${codigoStock}` : "ese código"}.`
      : error.detalle;
  }
  return undefined;
}

export async function crearRepuesto(_prev: RepuestoState, formData: FormData): Promise<RepuestoState> {
  const { error, valores, cuerpo } = leerRepuesto(formData);
  if (!cuerpo) return { error, valores };

  try {
    await apiFetch<void>("/api/repuestos", { method: "POST", body: JSON.stringify(cuerpo) });
  } catch (error) {
    const mensaje = mensajeComun(error, "registrar repuestos", cuerpo.codigoStock);
    if (mensaje) return { error: mensaje, valores };
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del repuesto e intenta de nuevo.", valores };
    }
    console.error("Error al registrar repuesto:", error);
    return { error: "No se pudo registrar el repuesto. Intenta más tarde.", valores };
  }

  redirect("/admin/repuestos");
}

export async function actualizarRepuesto(
  idRepuesto: number,
  activo: boolean,
  _prev: RepuestoState,
  formData: FormData,
): Promise<RepuestoState> {
  const { error, valores, cuerpo } = leerRepuesto(formData);
  if (!cuerpo) return { error, valores };

  try {
    await apiFetch<void>(`/api/repuestos/${idRepuesto}`, {
      method: "PUT",
      body: JSON.stringify({ ...cuerpo, activo }),
    });
  } catch (error) {
    const mensaje = mensajeComun(error, "editar repuestos", cuerpo.codigoStock);
    if (mensaje) return { error: mensaje, valores };
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del repuesto e intenta de nuevo.", valores };
    }
    console.error("Error al actualizar repuesto:", error);
    return { error: "No se pudo guardar el repuesto. Intenta más tarde.", valores };
  }

  refresh();
  return { ok: true };
}

export async function darDeBajaRepuesto(idRepuesto: number): Promise<AccionRepuestoState> {
  try {
    await apiFetch<void>(`/api/repuestos/${idRepuesto}`, { method: "DELETE" });
  } catch (error) {
    const mensaje = mensajeComun(error, "dar de baja repuestos");
    if (mensaje) return { error: mensaje };
    console.error("Error al dar de baja repuesto:", error);
    return { error: "No se pudo dar de baja el repuesto. Intenta más tarde." };
  }

  refresh();
  return undefined;
}

export async function reactivarRepuesto(idRepuesto: number): Promise<AccionRepuestoState> {
  try {
    const { codigoStock, nombre, precioUnitario } = await apiFetch<Repuesto>(`/api/repuestos/${idRepuesto}`);
    await apiFetch<void>(`/api/repuestos/${idRepuesto}`, {
      method: "PUT",
      body: JSON.stringify({ codigoStock, nombre, precioUnitario, activo: true }),
    });
  } catch (error) {
    const mensaje = mensajeComun(error, "reactivar repuestos");
    if (mensaje) return { error: mensaje };
    console.error("Error al reactivar repuesto:", error);
    return { error: "No se pudo reactivar el repuesto. Intenta más tarde." };
  }

  refresh();
  return undefined;
}

export async function fijarExistencia(
  idSucursal: number,
  idRepuesto: number,
  _prev: RepuestoState,
  formData: FormData,
): Promise<RepuestoState> {
  const texto = String(formData.get("cantidad") ?? "").trim();
  const cantidad = Number(texto);
  const valores = { cantidad: texto };

  if (!texto || !Number.isInteger(cantidad) || cantidad < 0 || cantidad > CANTIDAD_MAXIMA) {
    return { error: "La cantidad debe ser un número entero de 0 en adelante.", valores };
  }

  try {
    await apiFetch<void>(`/api/sucursales/${idSucursal}/inventario/${idRepuesto}`, {
      method: "PUT",
      body: JSON.stringify({ cantidad }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return { error: error.detalle ?? "Tu cuenta no tiene permiso para ajustar el inventario.", valores };
    }
    if (error instanceof ApiError && error.status === 404) {
      return { error: "La sede o el repuesto ya no existen.", valores };
    }
    if (error instanceof ApiError && error.status === 409) {
      return { error: error.detalle ?? "Otra persona ajustó esta existencia al mismo tiempo. Intenta de nuevo.", valores };
    }
    console.error("Error al ajustar existencia:", error);
    return { error: "No se pudo guardar la existencia. Intenta más tarde.", valores };
  }

  refresh();
  return { ok: true };
}
