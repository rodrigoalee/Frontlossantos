import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { requireEnv } from "@/lib/env";

// OAuth 2.0 de Google: Authorization Code + PKCE
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALLBACK_PATH = "/auth/google/callback";

export const OAUTH_COOKIE = {
  state: "google_oauth_state",
  verifier: "google_oauth_verifier",
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth/google",
    maxAge: 60 * 10, // 10 minutos para completar el login
  },
} as const;

const randomString = () => randomBytes(32).toString("base64url");

export function getRedirectUri(requestUrl: string) {
  return new URL(CALLBACK_PATH, requestUrl).toString();
}

export function createAuthorizationUrl(redirectUri: string) {
  const state = randomString();
  const codeVerifier = randomString();
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  return { url, state, codeVerifier };
}

/** Intercambia el código de autorización por el id_token del usuario. */
export async function exchangeCodeForIdToken(code: string, codeVerifier: string, redirectUri: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
    }),
  });

  if (!res.ok) throw new Error(`Google rechazó el intercambio de código (${res.status}).`);
  const { id_token } = (await res.json()) as { id_token: string };
  return id_token;
}
