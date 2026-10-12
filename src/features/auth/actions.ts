"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { createSession } from "./session";
import type { LoginResponse, LoginState } from "./types";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Ingresa tu usuario y contraseña.", username };
  }

  try {
    const { token } = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    await createSession(token);
  } catch (error) {
    const isInvalidCredentials = error instanceof ApiError && [400, 401].includes(error.status);
    return {
      error: isInvalidCredentials
        ? "Usuario o contraseña incorrectos."
        : "No se pudo conectar con el servidor. Intenta más tarde.",
      username,
    };
  }

  redirect("/");
}
