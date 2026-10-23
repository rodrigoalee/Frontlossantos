"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { createSession, destroySession, RUTA_DESPUES_DE_LOGIN } from "./session";
import type { CompletarPerfilState, LoginResponse, LoginState, UsuarioSesion } from "./types";

/** Mismo formato que exige la API: E.164, porque el teléfono se usa para WhatsApp. */
const TELEFONO_E164 = /^\+[1-9]\d{7,14}$/;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const correo = String(formData.get("correo") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!correo || !password) {
    return { error: "Ingresa tu correo y contraseña.", correo };
  }

  try {
    const sesion = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password }),
    });
    await createSession(sesion);
  } catch (error) {
    if (error instanceof ApiError && [400, 401].includes(error.status)) {
      return { error: "Correo o contraseña incorrectos.", correo };
    }
    console.error("Error en login:", error);
    return { error: "No se pudo conectar con el servidor. Intenta más tarde.", correo };
  }

  redirect(RUTA_DESPUES_DE_LOGIN);
}

/** Entrega el teléfono que falta en una cuenta creada con Google; la API crea la ficha del taller. */
export async function completarPerfil(
  _prev: CompletarPerfilState,
  formData: FormData,
): Promise<CompletarPerfilState> {
  const telefono = String(formData.get("telefono") ?? "").trim();

  if (!TELEFONO_E164.test(telefono)) {
    return { error: "El teléfono debe incluir el código de país, por ejemplo +50255551234.", telefono };
  }

  try {
    await apiFetch<void>("/api/auth/perfil", {
      method: "POST",
      body: JSON.stringify({ telefono }),
    });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("Error al completar perfil:", error);
      return { error: "No se pudo conectar con el servidor. Intenta más tarde.", telefono };
    }
    if (error.status === 401) {
      await destroySession();
      redirect("/login");
    }
    if (error.status === 409) {
      // El 409 también llega si el perfil ya estaba completo (doble envío): en ese caso, al portal.
      const usuario = await apiFetch<UsuarioSesion>("/api/auth/me").catch(() => undefined);
      if (usuario?.perfilCompleto) redirect(RUTA_DESPUES_DE_LOGIN);
      return {
        error: "Ese correo ya está registrado en el taller. Comunícate con nosotros para activar tu acceso.",
        telefono,
      };
    }
    if (error.status === 403) {
      return { error: "Esta cuenta no completa su perfil desde el portal.", telefono };
    }
    return { error: "No se pudo guardar el teléfono. Revisa el formato e intenta de nuevo.", telefono };
  }

  redirect(RUTA_DESPUES_DE_LOGIN);
}

/** Cierra la sesión del portal. */
export async function cerrarSesion() {
  await destroySession();
  redirect("/login");
}
