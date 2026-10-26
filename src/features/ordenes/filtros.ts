import type { EstadoOrden } from "./types";

export const FILTROS_ORDENES = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "recepcion", etiqueta: "En recepción", estado: "EnRecepcion" },
  { valor: "proceso", etiqueta: "En proceso", estado: "EnProceso" },
  { valor: "finalizadas", etiqueta: "Finalizadas", estado: "Finalizado" },
] as const satisfies readonly { valor: string; etiqueta: string; estado?: EstadoOrden }[];

export type FiltroOrdenes = (typeof FILTROS_ORDENES)[number];

export function leerFiltroOrdenes(valor: string | string[] | undefined): FiltroOrdenes {
  return FILTROS_ORDENES.find((filtro) => filtro.valor === valor) ?? FILTROS_ORDENES[0];
}

export function leerBusqueda(valor: string | string[] | undefined) {
  return (Array.isArray(valor) ? valor[0] : valor)?.trim().slice(0, 100) ?? "";
}
