import "server-only";
import { ApiError, apiFetch } from "@/lib/api";

export type PerfilPortal = {
  nombreCompleto: string;
  correo: string;
  telefono: string;
};

export async function obtenerMiPerfil(): Promise<PerfilPortal | null> {
  try {
    return await apiFetch<PerfilPortal>("/api/portal/perfil");
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  }
}
