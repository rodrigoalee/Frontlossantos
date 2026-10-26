import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { getSessionToken } from "./session";
import type { UsuarioSesion } from "./types";

export const RUTA_ADMIN = "/admin";

export function esEmpleado(usuario: UsuarioSesion) {
  return (usuario.permisos?.length ?? 0) > 0;
}

export const verificarSesion = cache(async (): Promise<UsuarioSesion> => {
  if (!(await getSessionToken())) redirect("/login");

  let usuario: UsuarioSesion | undefined;
  try {
    usuario = await apiFetch<UsuarioSesion>("/api/auth/me");
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) throw error;
  }

  if (!usuario) redirect("/login");
  return usuario;
});

export const verificarPerfilCompleto = cache(async (): Promise<UsuarioSesion> => {
  const usuario = await verificarSesion();
  if (esEmpleado(usuario)) redirect(RUTA_ADMIN);
  if (!usuario.perfilCompleto) redirect("/completar-perfil");
  return usuario;
});

export const verificarEmpleado = cache(async (): Promise<UsuarioSesion> => {
  const usuario = await verificarSesion();
  if (!esEmpleado(usuario)) redirect("/panel");
  return usuario;
});
