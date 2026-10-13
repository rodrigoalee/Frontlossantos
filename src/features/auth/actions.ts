"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { createSession } from "./session";
import type { LoginResponse, LoginState } from "./types";

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

  redirect("/");
}
