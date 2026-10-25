"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { RegistrarVehiculoState } from "./types";

const ANIO_MINIMO = 1900;
const ANIO_MAXIMO = 2100;

export async function registrarVehiculo(
  _prev: RegistrarVehiculoState,
  formData: FormData,
): Promise<RegistrarVehiculoState> {
  const valores = {
    placa: String(formData.get("placa") ?? "").trim(),
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

  try {
    await apiFetch<{ idVehiculo: number }>("/api/portal/vehiculos", {
      method: "POST",
      body: JSON.stringify({ placa: valores.placa, marca: valores.marca, modelo: valores.modelo, anio }),
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
