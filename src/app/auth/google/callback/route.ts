import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { exchangeCodeForIdToken, getRedirectUri, OAUTH_COOKIE } from "@/features/auth/google";
import { createSession, RUTA_DESPUES_DE_LOGIN } from "@/features/auth/session";
import type { LoginResponse } from "@/features/auth/types";
import { apiFetch } from "@/lib/api";

const LOGIN_ERROR_URL = "/login?error=google";

/** Google redirige aquí con el código; se valida y se crea la sesión con la API. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get(OAUTH_COOKIE.state)?.value;
  const codeVerifier = cookieStore.get(OAUTH_COOKIE.verifier)?.value;
  cookieStore.delete({ name: OAUTH_COOKIE.state, path: OAUTH_COOKIE.options.path });
  cookieStore.delete({ name: OAUTH_COOKIE.verifier, path: OAUTH_COOKIE.options.path });

  if (!code || !codeVerifier || !state || state !== savedState) redirect(LOGIN_ERROR_URL);

  try {
    const idToken = await exchangeCodeForIdToken(code, codeVerifier, getRedirectUri(request.url));
    const sesion = await apiFetch<LoginResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
    await createSession(sesion);
  } catch (error) {
    console.error("Error en login con Google:", error);
    redirect(LOGIN_ERROR_URL);
  }

  redirect(RUTA_DESPUES_DE_LOGIN);
}
