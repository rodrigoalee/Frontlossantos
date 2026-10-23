import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { getSessionToken } from "./session";
import type { UsuarioSesion } from "./types";

/**
 * Usuario de la sesión actual, consultado a la API en cada render.
 * Sin sesión válida, manda a /login. La cookie vencida no se borra aquí porque
 * un Server Component no puede escribir cookies; el siguiente login la reemplaza.
 */
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

/**
 * Como verificarSesion, pero además exige el perfil completo: una cuenta de Google
 * sin teléfono va a /completar-perfil. Toda página del portal debe llamarla, porque
 * los layouts no se vuelven a ejecutar al navegar entre páginas.
 */
export const verificarPerfilCompleto = cache(async (): Promise<UsuarioSesion> => {
  const usuario = await verificarSesion();
  if (!usuario.perfilCompleto) redirect("/completar-perfil");
  return usuario;
});
