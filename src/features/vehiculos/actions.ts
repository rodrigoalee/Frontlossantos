"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { EliminarVehiculoState, RegistrarVehiculoState } from "./types";

const ANIO_MINIMO = 1900;
const ANIO_MAXIMO = 2100;

type VehiculoLeido = {
  error?: string;
  valores: Record<string, string>;
  cuerpo?: { placa: string; marca: string; modelo: string; anio: number };
};

function leerVehiculo(formData: FormData): VehiculoLeido {
  const valores = {
    placa: String(formData.get("placa") ?? "").toUpperCase().replace(/[\s-]/g, ""),
    marca: String(formData.get("marca") ?? "").trim(),
    modelo: String(formData.get("modelo") ?? "").trim(),
    anio: String(formData.get("anio") ?? "").trim(),
  };
  const anio = Number(valores.anio);

  if (!valores.placa || !valores.marca || !valores.modelo || !valores.anio) {
    return { error: "Completa la placa, la marca, el modelo y el año.", valores };
  }
  if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > ANIO_MAXIMO) {
    return { error: `El año debe estar entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`, valores };
  }
  return { valores, cuerpo: { placa: valores.placa, marca: valores.marca, modelo: valores.modelo, anio } };
}

export async function registrarVehiculo(
  _prev: RegistrarVehiculoState,
  formData: FormData,
): Promise<RegistrarVehiculoState> {
  const { error, valores, cuerpo } = leerVehiculo(formData);
  if (!cuerpo) return { error, valores };

  try {
    await apiFetch<{ idVehiculo: number }>("/api/portal/vehiculos", {
      method: "POST",
      body: JSON.stringify(cuerpo),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 409 && error.detalle) {
      return { error: error.detalle, valores };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del vehículo e intenta de nuevo.", valores };
    }
    console.error("Error al registrar vehículo:", error);
    return { error: "No se pudo registrar el vehículo. Intenta más tarde.", valores };
  }

  refresh();
  return { ok: true };
}

export async function agregarVehiculoACliente(
  clienteId: number,
  _prev: RegistrarVehiculoState,
  formData: FormData,
): Promise<RegistrarVehiculoState> {
  const { error, valores, cuerpo } = leerVehiculo(formData);
  if (!cuerpo) return { error, valores };

  try {
    await apiFetch<void>("/api/vehiculos", {
      method: "POST",
      body: JSON.stringify({ ...cuerpo, clienteId }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return { error: "Tu cuenta no tiene permiso para registrar vehículos.", valores };
    }
    if (error instanceof ApiError && error.status === 409) {
      return { error: "Ya hay un vehículo registrado con esa placa.", valores };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del vehículo e intenta de nuevo.", valores };
    }
    console.error("Error al registrar vehículo:", error);
    return { error: "No se pudo registrar el vehículo. Intenta más tarde.", valores };
  }

  refresh();
  return { ok: true };
}

export async function actualizarVehiculo(
  idVehiculo: number,
  clienteId: number,
  _prev: RegistrarVehiculoState,
  formData: FormData,
): Promise<RegistrarVehiculoState> {
  const { error, valores, cuerpo } = leerVehiculo(formData);
  if (!cuerpo) return { error, valores };

  try {
    await apiFetch<void>(`/api/vehiculos/${idVehiculo}`, {
      method: "PUT",
      body: JSON.stringify({ ...cuerpo, clienteId }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return { error: "Tu cuenta no tiene permiso para editar vehículos.", valores };
    }
    if (error instanceof ApiError && error.status === 404) {
      return { error: "Este vehículo ya no existe.", valores };
    }
    if (error instanceof ApiError && error.status === 409) {
      return { error: "Ya hay un vehículo registrado con esa placa.", valores };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos del vehículo e intenta de nuevo.", valores };
    }
    console.error("Error al actualizar vehículo:", error);
    return { error: "No se pudo guardar el vehículo. Intenta más tarde.", valores };
  }

  refresh();
  return { ok: true };
}

export async function eliminarVehiculo(idVehiculo: number): Promise<EliminarVehiculoState> {
  try {
    await apiFetch<void>(`/api/vehiculos/${idVehiculo}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return { error: "Tu cuenta no tiene permiso para eliminar vehículos." };
    }
    if (error instanceof ApiError && error.status === 409) {
      return { error: "Este vehículo ya tiene citas u órdenes, por eso no se puede eliminar." };
    }
    if (!(error instanceof ApiError && error.status === 404)) {
      console.error("Error al eliminar vehículo:", error);
      return { error: "No se pudo eliminar el vehículo. Intenta más tarde." };
    }
  }

  refresh();
  return undefined;
}
