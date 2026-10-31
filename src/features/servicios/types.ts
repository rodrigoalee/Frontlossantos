export type { ServicioCatalogo } from "@/features/ordenes/types";

export type ServicioState = {
  error?: string;
  ok?: boolean;
  valores?: Record<string, string>;
} | undefined;

export type AccionServicioState = {
  error?: string;
} | undefined;
