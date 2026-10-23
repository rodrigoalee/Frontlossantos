import "server-only";
import { getSessionToken } from "@/features/auth/session";
import { requireEnv } from "./env";

// Generoso: las APIs en planes gratis tardan en "despertar"
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Cliente HTTP para la API del taller (solo se ejecuta en el servidor). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSessionToken();

  const res = await fetch(new URL(path, requireEnv("API_URL")), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) throw new ApiError(res.status, res.statusText);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
