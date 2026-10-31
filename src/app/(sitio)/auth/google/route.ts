import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createAuthorizationUrl, getRedirectUri, OAUTH_COOKIE } from "@/features/auth/google";

/** Inicia el login con Google: guarda state/PKCE y redirige a la pantalla de Google. */
export async function GET(request: NextRequest) {
  const { url, state, codeVerifier } = createAuthorizationUrl(getRedirectUri(request.url));

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_COOKIE.state, state, OAUTH_COOKIE.options);
  cookieStore.set(OAUTH_COOKIE.verifier, codeVerifier, OAUTH_COOKIE.options);

  redirect(url.toString());
}
