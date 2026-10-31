"use server";

import { redirect } from "next/navigation";
import { obtenerCliente } from "@/features/clientes/dal";
import { validarVehiculo } from "@/features/vehiculos/validacion";
import { ApiError, apiFetch } from "@/lib/api";
import { completarTelefono, CORREO, TELEFONO_E164 } from "@/lib/validaciones";
import type { ClienteMostrador, DatosCitaMostrador, DatosClienteNuevo, DatosVehiculoNuevo, Resultado, VehiculoMostrador } from "./types";

// Misma duración fija que usan las citas del portal.
const DURACION_MINUTOS = 60;

function traducirError(error: unknown, contexto: string): { error: string } {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect("/login");
    if (error.status === 403) return { error: "Tu cuenta no tiene permiso para esta acción." };
    if ((error.status === 400 || error.status === 409) && error.detalle) return { error: error.detalle };
    if (error.status === 400) return { error: "Revisa los datos e intenta de nuevo." };
  }
  console.error(`Error al ${contexto}:`, error);
  return { error: "No se pudo completar la acción. Intenta más tarde." };
}

export async function registrarClienteMostrador(datos: DatosClienteNuevo): Promise<Resultado<ClienteMostrador>> {
  const cliente = {
    nombreCompleto: datos.nombreCompleto.trim(),
    telefono: completarTelefono(datos.telefono),
    correo: datos.correo.trim().toLowerCase(),
    nit: datos.nit.trim() || null,
  };
  if (!cliente.nombreCompleto || !cliente.telefono || !cliente.correo) {
    return { error: "Completa el nombre, el teléfono y el correo." };
  }
  if (!TELEFONO_E164.test(cliente.telefono)) {
    return { error: "El teléfono debe incluir el código de país, por ejemplo +50255551234." };
  }
  if (!CORREO.test(cliente.correo)) return { error: "Revisa el formato del correo." };

  try {
    const { idCliente } = await apiFetch<{ idCliente: number }>("/api/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    });
    return { ok: { idCliente, nombreCompleto: cliente.nombreCompleto, telefono: cliente.telefono, correo: cliente.correo } };
  } catch (error) {
    return traducirError(error, "registrar el cliente");
  }
}

export async function vehiculosDeCliente(idCliente: number): Promise<Resultado<VehiculoMostrador[]>> {
  try {
    return { ok: (await obtenerCliente(idCliente)).vehiculos };
  } catch (error) {
    return traducirError(error, "cargar los vehículos del cliente");
  }
}

export async function registrarVehiculoMostrador(
  idCliente: number,
  datos: DatosVehiculoNuevo,
): Promise<Resultado<VehiculoMostrador>> {
  const { error, cuerpo } = validarVehiculo(datos);
  if (!cuerpo) return { error: error! };

  try {
    const { idVehiculo } = await apiFetch<{ idVehiculo: number }>("/api/vehiculos", {
      method: "POST",
      body: JSON.stringify({ clienteId: idCliente, ...cuerpo }),
    });
    return { ok: { idVehiculo, ...cuerpo } };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409 && !error.detalle) {
      return { error: "Ya hay un vehículo registrado con esa placa." };
    }
    return traducirError(error, "registrar el vehículo");
  }
}

export async function crearCitaMostrador(datos: DatosCitaMostrador): Promise<{ error: string }> {
  const fecha = new Date(datos.fechaHora);
  if (!datos.vehiculoId || Number.isNaN(fecha.getTime())) {
    return { error: "Elige el servicio y la fecha de la cita." };
  }
  if (datos.servicioId === null && !datos.motivo.trim()) {
    return { error: "Describe el servicio que necesita el cliente para poder cotizarlo." };
  }

  let idCita: number;
  try {
    ({ idCita } = await apiFetch<{ idCita: number }>("/api/citas", {
      method: "POST",
      body: JSON.stringify({
        vehiculoId: datos.vehiculoId,
        servicioId: datos.servicioId,
        sucursalId: datos.sucursalId,
        fechaHora: datos.fechaHora,
        duracionMinutos: DURACION_MINUTOS,
        motivo: datos.motivo.trim() || null,
        servicioPersonalizado: datos.servicioId === null,
      }),
    }));
  } catch (error) {
    return traducirError(error, "crear la cita");
  }
  redirect(`/admin/citas/${idCita}`);
}
