import "server-only";
import { requireEnv } from "./env";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Cliente HTTP para la API del taller (solo se ejecuta en el servidor). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${requireEnv("API_URL")}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return res.json() as Promise<T>;
}
