import "server-only";
import { apiFetch } from "@/lib/api";
import type { CitaPortal } from "./types";

export function obtenerMisCitas() {
  return apiFetch<CitaPortal[]>("/api/portal/citas");
}
