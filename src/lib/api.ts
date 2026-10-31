import "server-only";
import { getSessionToken } from "@/features/auth/session";
import { requireEnv } from "./env";

// Generoso: las APIs en planes gratis tardan en "despertar"
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(public status: number, message: string, public detalle?: string) {
    super(message);
  }
}

async function leerDetalle(res: Response): Promise<string | undefined> {
  if (!res.headers.get("content-type")?.includes("application/problem+json")) return undefined;
  const problema = await res.json().catch(() => undefined);
  return typeof problema?.detail === "string" ? problema.detail : undefined;
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

  if (!res.ok) throw new ApiError(res.status, res.statusText, await leerDetalle(res));
  if (res.status === 204 || !res.headers.get("content-type")?.includes("json")) return undefined as T;
  return res.json() as Promise<T>;
}

/** Descarga un archivo de la API tal cual (Excel, PDF); el error se lee igual que en apiFetch. */
export async function apiDescargar(path: string): Promise<Response> {
  const token = await getSessionToken();

  const res = await fetch(new URL(path, requireEnv("API_URL")), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS * 2),
  });

  if (!res.ok) throw new ApiError(res.status, res.statusText, await leerDetalle(res));
  return res;
}
