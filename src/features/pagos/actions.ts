"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { DatosTarjeta, ResultadoAccion, ResultadoPago } from "./types";

function traducirError(error: unknown, contexto: string): { error: string } {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect("/login");
    if (error.status === 403) return { error: "Tu cuenta no tiene permiso para esta acción." };
    if (error.status === 404) return { error: "La factura ya no existe." };
    if ((error.status === 400 || error.status === 409) && error.detalle) return { error: error.detalle };
  }
  console.error(`Error al ${contexto}:`, error);
  return { error: "No se pudo completar la acción. Intenta más tarde." };
}

/** Cobro en caja: emite la factura de la orden y le manda al cliente el enlace de pago por mensaje y correo. */
export async function facturarYEnviarEnlace(idOrden: number): Promise<ResultadoAccion> {
  try {
    const { idFactura } = await apiFetch<{ idFactura: number }>("/api/facturas", {
      method: "POST",
      body: JSON.stringify({ ordenTrabajoId: idOrden }),
    });
    await apiFetch<void>(`/api/facturas/${idFactura}/enlace-pago`, { method: "POST" });
  } catch (error) {
    return traducirError(error, "emitir la factura");
  }
  refresh();
  return { ok: "Factura emitida y enlace de pago enviado por mensaje y correo." };
}

export async function reenviarEnlace(idFactura: number): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/facturas/${idFactura}/enlace-pago`, { method: "POST" });
  } catch (error) {
    return traducirError(error, "reenviar el enlace de pago");
  }
  return { ok: "Enlace de pago reenviado por mensaje y correo." };
}

export async function registrarPagoEfectivo(idFactura: number): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/facturas/${idFactura}/pago`, { method: "PATCH", body: JSON.stringify({ stripePaymentId: null }) });
  } catch (error) {
    return traducirError(error, "registrar el pago en efectivo");
  }
  refresh();
  return { ok: "Pago en efectivo registrado." };
}

/** Pasarela pública: no hay sesión, la autoriza el token del enlace. */
export async function pagarConTarjeta(token: string, datos: DatosTarjeta): Promise<ResultadoPago> {
  try {
    return await apiFetch<ResultadoPago>(`/api/pasarela/${encodeURIComponent(token)}`, {
      method: "POST",
      body: JSON.stringify(datos),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { pagado: false, mensaje: "El enlace de pago venció. Pide uno nuevo en el taller." };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { pagado: false, mensaje: "Demasiados intentos. Espera unos minutos e intenta de nuevo." };
    }
    if (error instanceof ApiError && (error.status === 400 || error.status === 409)) {
      return { pagado: false, mensaje: error.detalle ?? "Revisa los datos de la tarjeta." };
    }
    console.error("Error en la pasarela de pago:", error instanceof Error ? error.message : error);
    return { pagado: false, mensaje: "No se pudo procesar el pago. Intenta más tarde." };
  }
}
