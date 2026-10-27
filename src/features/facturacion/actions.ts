"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";

/** Portal del cliente: pide un enlace firmado para su factura y lo lleva a la pasarela. */
export async function irAPagar(idFactura: number): Promise<{ error: string }> {
  let token: string;
  try {
    ({ token } = await apiFetch<{ token: string }>(`/api/portal/facturas/${idFactura}/enlace-pago`, { method: "POST" }));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 409 && error.detalle) return { error: error.detalle };
    if (error instanceof ApiError && error.status === 404) return { error: "No encontramos esa factura." };
    console.error("Error al preparar el pago:", error);
    return { error: "No se pudo abrir el pago. Intenta más tarde." };
  }
  redirect(`/pagar/${encodeURIComponent(token)}`);
}
