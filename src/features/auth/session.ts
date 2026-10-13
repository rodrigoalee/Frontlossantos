import "server-only";
import { cookies } from "next/headers";
import type { LoginResponse } from "./types";

const SESSION_COOKIE = "session";

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
