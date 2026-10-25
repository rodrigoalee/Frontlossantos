import "server-only";
import { apiFetch } from "@/lib/api";
import type { Vehiculo } from "./types";

export function obtenerMisVehiculos() {
  return apiFetch<Vehiculo[]>("/api/portal/vehiculos");
}
