"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { completarTelefono, TELEFONO_E164 } from "@/lib/validaciones";
import { createSession, destroySession, RUTA_DESPUES_DE_LOGIN } from "./session";
import type { CompletarPerfilState, LoginResponse, LoginState, RegistroState, UsuarioSesion } from "./types";

export async function registrar(_prev: RegistroState, formData: FormData): Promise<RegistroState> {
  const valores = {
    nombreCompleto: String(formData.get("nombreCompleto") ?? "").trim(),
    correo: String(formData.get("correo") ?? "").trim(),
    telefono: completarTelefono(String(formData.get("telefono") ?? "")),
  };
  const password = String(formData.get("password") ?? "");

  if (!valores.nombreCompleto || !valores.correo || !valores.telefono || !password) {
    return { error: "Completa todos los campos.", valores };
  }
  if (!TELEFONO_E164.test(valores.telefono)) {
    return { error: "El teléfono debe incluir el código de país, por ejemplo +50255551234.", valores };
  }
  if (password.length < 12) {
    return { error: "La contraseña debe tener al menos 12 caracteres.", valores };
  }
  if (password !== formData.get("confirmarPassword")) {
    return { error: "Las contraseñas no coinciden.", valores };
  }

  try {
    const sesion = await apiFetch<LoginResponse>("/api/auth/registro", {
      method: "POST",
      body: JSON.stringify({ ...valores, password }),
    });
    await createSession(sesion);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { error: error.detalle ?? "Ya existe una cuenta con ese correo.", valores };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo.", valores };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Revisa los datos e intenta de nuevo.", valores };
    }
    console.error("Error en registro:", error);
    return { error: "No se pudo conectar con el servidor. Intenta más tarde.", valores };
  }

  redirect(RUTA_DESPUES_DE_LOGIN);
}

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

export async function completarPerfil(
  _prev: CompletarPerfilState,
  formData: FormData,
): Promise<CompletarPerfilState> {
  const telefono = completarTelefono(String(formData.get("telefono") ?? ""));

  if (!TELEFONO_E164.test(telefono)) {
    return { error: "El teléfono debe incluir el código de país, por ejemplo +50241961558.", telefono };
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

export async function cerrarSesion() {
  await destroySession();
  redirect("/login");
}
