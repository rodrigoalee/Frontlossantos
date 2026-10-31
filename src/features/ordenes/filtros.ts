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

export type FiltroMisOrdenes = Extract<FiltroOrdenes, { estado: EstadoOrden }>;

export const FILTROS_MIS_ORDENES = FILTROS_ORDENES.filter((filtro): filtro is FiltroMisOrdenes => "estado" in filtro);

export function leerFiltroMisOrdenes(valor: string | string[] | undefined): FiltroMisOrdenes {
  return FILTROS_MIS_ORDENES.find((filtro) => filtro.valor === valor) ?? FILTROS_MIS_ORDENES[0];
}

export function leerPagina(valor: string | string[] | undefined) {
  const pagina = Number(Array.isArray(valor) ? valor[0] : valor);
  return Number.isInteger(pagina) && pagina > 0 ? Math.min(pagina, 10_000) : 1;
}
