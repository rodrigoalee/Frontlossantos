"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { CORREO } from "@/lib/validaciones";
import type { DatosUsuario, ResultadoAccion } from "./types";

const MINIMO_PASSWORD = 12;

function traducirError(error: unknown, contexto: string): { error: string } {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect("/login");
    if (error.status === 403) return { error: "Tu cuenta no tiene permiso para esta acción." };
    if (error.status === 404) return { error: "El registro ya no existe. Recarga la página." };
    if ((error.status === 400 || error.status === 409) && error.detalle) return { error: error.detalle };
    if (error.status === 400) return { error: "Revisa los datos e intenta de nuevo." };
  }
  console.error(`Error al ${contexto}:`, error);
  return { error: "No se pudo completar la acción. Intenta más tarde." };
}

function validarDatos(datos: DatosUsuario) {
  if (!datos.nombreCompleto.trim() || !datos.correo.trim()) return "Completa el nombre y el correo.";
  if (!CORREO.test(datos.correo.trim())) return "Revisa el formato del correo.";
  if (!datos.rolId) return "Elige el rol.";
  return undefined;
}

function validarPassword(password: string) {
  return password.length < MINIMO_PASSWORD
    ? `La contraseña debe tener al menos ${MINIMO_PASSWORD} caracteres.`
    : undefined;
}

function cuerpoUsuario(datos: DatosUsuario) {
  return {
    nombreCompleto: datos.nombreCompleto.trim(),
    correo: datos.correo.trim().toLowerCase(),
    rolId: datos.rolId,
    sucursalId: datos.sucursalId,
  };
}

export async function crearUsuario(datos: DatosUsuario, password: string): Promise<ResultadoAccion> {
  const invalido = validarDatos(datos) ?? validarPassword(password);
  if (invalido) return { error: invalido };

  try {
    await apiFetch<void>("/api/usuarios", {
      method: "POST",
      body: JSON.stringify({ ...cuerpoUsuario(datos), password }),
    });
  } catch (error) {
    return traducirError(error, "crear el usuario");
  }
  redirect("/admin/usuarios");
}

export async function actualizarUsuario(idUsuario: number, datos: DatosUsuario): Promise<ResultadoAccion> {
  const invalido = validarDatos(datos);
  if (invalido) return { error: invalido };

  try {
    await apiFetch<void>(`/api/usuarios/${idUsuario}`, { method: "PUT", body: JSON.stringify(cuerpoUsuario(datos)) });
  } catch (error) {
    return traducirError(error, "actualizar el usuario");
  }
  refresh();
  return undefined;
}

export async function restablecerPassword(idUsuario: number, password: string): Promise<ResultadoAccion> {
  const invalido = validarPassword(password);
  if (invalido) return { error: invalido };

  try {
    await apiFetch<void>(`/api/usuarios/${idUsuario}/password`, { method: "PATCH", body: JSON.stringify({ password }) });
  } catch (error) {
    return traducirError(error, "restablecer la contraseña");
  }
  return undefined;
}

export async function cambiarEstadoUsuario(idUsuario: number, activo: boolean): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/usuarios/${idUsuario}/estado`, { method: "PATCH", body: JSON.stringify({ activo }) });
  } catch (error) {
    return traducirError(error, "cambiar el estado del usuario");
  }
  refresh();
  return undefined;
}

export async function guardarRol(idRol: number | null, nombre: string, descripcion: string): Promise<ResultadoAccion> {
  if (!nombre.trim()) return { error: "Escribe el nombre del rol." };

  const cuerpo = JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() || null });
  let nuevoId = idRol;
  try {
    if (idRol) {
      await apiFetch<void>(`/api/roles/${idRol}`, { method: "PUT", body: cuerpo });
    } else {
      nuevoId = (await apiFetch<{ idRol: number }>("/api/roles", { method: "POST", body: cuerpo })).idRol;
    }
  } catch (error) {
    return traducirError(error, "guardar el rol");
  }
  redirect(`/admin/usuarios?tab=roles&rol=${nuevoId}`);
}

export async function eliminarRol(idRol: number): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/roles/${idRol}`, { method: "DELETE" });
  } catch (error) {
    return traducirError(error, "eliminar el rol");
  }
  redirect("/admin/usuarios?tab=roles");
}

export async function cambiarPermisoDeRol(idRol: number, idPermiso: number, asignar: boolean): Promise<ResultadoAccion> {
  try {
    await apiFetch<void>(`/api/roles/${idRol}/permisos/${idPermiso}`, { method: asignar ? "PUT" : "DELETE" });
  } catch (error) {
    return traducirError(error, "cambiar el permiso del rol");
  }
  return undefined;
}
