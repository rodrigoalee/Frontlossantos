import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { getSessionToken } from "./session";
import type { UsuarioSesion } from "./types";

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
  if (!usuario.perfilCompleto) redirect("/completar-perfil");
  return usuario;
});
