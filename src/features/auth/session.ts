import "server-only";
import { cookies } from "next/headers";
import type { LoginResponse } from "./types";

const SESSION_COOKIE = "session";

/** Página a la que se envía al usuario después de iniciar sesión. */
export const RUTA_DESPUES_DE_LOGIN = "/panel";

/** Guarda el JWT de la API en una cookie httpOnly que expira junto con el token. */
export async function createSession({ accessToken, expiraEn }: LoginResponse) {
  if (!accessToken) throw new Error("La API no devolvió un accessToken.");

  (await cookies()).set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiraEn),
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/" });
}
