import type { EstadoCita } from "./types";

export const FILTROS_CITAS = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "programadas", etiqueta: "Programadas", estado: "Pendiente" },
  { valor: "confirmadas", etiqueta: "Confirmadas", estado: "Confirmada" },
  { valor: "canceladas", etiqueta: "Canceladas", estado: "Cancelada" },
] as const satisfies readonly { valor: string; etiqueta: string; estado?: EstadoCita }[];

export type FiltroCitas = (typeof FILTROS_CITAS)[number];

export function leerFiltroCitas(valor: string | string[] | undefined): FiltroCitas {
  return FILTROS_CITAS.find((filtro) => filtro.valor === valor) ?? FILTROS_CITAS[0];
}
