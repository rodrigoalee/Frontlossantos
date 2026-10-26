"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { EditarClienteState, NuevoClienteState } from "./types";

const TELEFONO_E164 = /^\+[1-9]\d{7,14}$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function crearCliente(_prev: NuevoClienteState, formData: FormData): Promise<NuevoClienteState> {
  const valores = {
    nombreCompleto: String(formData.get("nombreCompleto") ?? "").trim(),
    telefono: String(formData.get("telefono") ?? "").replace(/[\s-]/g, ""),
    correo: String(formData.get("correo") ?? "").trim().toLowerCase(),
    nit: String(formData.get("nit") ?? "").trim(),
  };

  if (!valores.nombreCompleto || !valores.telefono || !valores.correo) {
    return { error: "Completa el nombre, el teléfono y el correo.", valores };
  }
  if (!TELEFONO_E164.test(valores.telefono)) {
    return { error: "El teléfono debe incluir el código de país, por ejemplo +50255551234.", valores };
  }
  if (!CORREO.test(valores.correo)) {
    return { error: "Revisa el formato del correo.", valores };
  }

  try {
    await apiFetch<void>("/api/clientes", {
      method: "POST",
      body: JSON.stringify({ ...valores, nit: valores.nit || null }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return { error: "Tu cuenta no tiene permiso para registrar clientes.", valores };
    }
    if (error instanceof ApiError && error.status === 409 && error.detalle) {
      return { error: error.detalle, valores };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del cliente e intenta de nuevo.", valores };
    }
    console.error("Error al registrar cliente:", error);
    return { error: "No se pudo registrar el cliente. Intenta más tarde.", valores };
  }

  redirect("/admin/clientes");
}

export async function actualizarCliente(
  idCliente: number,
  _prev: EditarClienteState,
  formData: FormData,
): Promise<EditarClienteState> {
  const campo = String(formData.get("campo") ?? "");
  const valores = {
    nombreCompleto: String(formData.get("nombreCompleto") ?? "").trim(),
    telefono: String(formData.get("telefono") ?? "").replace(/[\s-]/g, ""),
    correo: String(formData.get("correo") ?? "").trim().toLowerCase(),
    nit: String(formData.get("nit") ?? "").trim(),
  };

  if (!valores.nombreCompleto || !valores.telefono || !valores.correo) {
    return { error: "El nombre, el teléfono y el correo no pueden quedar vacíos." };
  }
  if (campo === "telefono" && !TELEFONO_E164.test(valores.telefono)) {
    return { error: "El teléfono debe incluir el código de país, por ejemplo +50255551234." };
  }
  if (campo === "correo" && !CORREO.test(valores.correo)) {
    return { error: "Revisa el formato del correo." };
  }

  try {
    await apiFetch<void>(`/api/clientes/${idCliente}`, {
      method: "PUT",
      body: JSON.stringify({ ...valores, nit: valores.nit || null }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return { error: "Tu cuenta no tiene permiso para editar clientes." };
    }
    if (error instanceof ApiError && error.status === 404) {
      return { error: "Este cliente ya no existe." };
    }
    if (error instanceof ApiError && error.status === 409 && error.detalle) {
      return { error: error.detalle };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa el dato e intenta de nuevo." };
    }
    console.error("Error al actualizar cliente:", error);
    return { error: "No se pudo guardar el cambio. Intenta más tarde." };
  }

  refresh();
  return { ok: true };
}
