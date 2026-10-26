"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import "@/features/clientes/components/tabla-clientes.css";
import { HotColumn, HotTable, type HotRendererProps } from "@handsontable/react-wrapper";
import esMX from "handsontable/i18n/languages/es-MX";
import { registerLanguageDictionary } from "handsontable/i18n";
import { registerAllModules } from "handsontable/registry";
import Link from "next/link";
import { memo, useMemo } from "react";
import { formatearMoneda } from "@/features/citas/formato";
import type { ServicioCatalogo } from "../types";

registerAllModules();
registerLanguageDictionary(esMX);

const MENU_FILTROS = ["filter_by_condition", "filter_by_value", "filter_action_bar"];
const SIN_ORDEN_NI_MENU = { indicator: false, headerAction: false };

function CeldaTarifa({ value }: HotRendererProps) {
  return <span className="block text-right tabular-nums">{formatearMoneda(Number(value))}</span>;
}

function CeldaEstado({ value }: HotRendererProps) {
  const activo = value === "Activo";
  return (
    <span className={`font-semibold ${activo ? "text-emerald-700" : "text-base-content/50"}`}>{String(value)}</span>
  );
}

function CeldaFicha({ value }: HotRendererProps) {
  return (
    <Link href={`/admin/servicios/${value}`} className="font-semibold text-secondary underline-offset-2 hover:underline">
      Ver ficha
    </Link>
  );
}

type Props = {
  servicios: ServicioCatalogo[];
  onConteo: (filas: number) => void;
};

function HotServicios({ servicios, onConteo }: Props) {
  const filas = useMemo(
    () => servicios.map((servicio) => ({ ...servicio, estado: servicio.activo ? "Activo" : "De baja" })),
    [servicios],
  );

  return (
    <HotTable
      className="tabla-clientes"
      themeName="ht-theme-main"
      licenseKey="non-commercial-and-evaluation"
      language="es-MX"
      data={filas}
      readOnly
      rowHeaders
      colHeaders
      height={560}
      width="100%"
      stretchH="all"
      columnSorting
      filters
      dropdownMenu={MENU_FILTROS}
      afterLoadData={function (this: { countRows: () => number }) {
        onConteo(this.countRows());
      }}
      afterFilter={function (this: { countRows: () => number }) {
        onConteo(this.countRows());
      }}
    >
      <HotColumn title="Servicio" data="nombre" width={320} />
      <HotColumn title="Mano de obra" data="tarifaManoObra" type="numeric" width={160} renderer={CeldaTarifa} />
      <HotColumn title="Estado" data="estado" width={120} renderer={CeldaEstado} />
      <HotColumn
        title="Ficha"
        data="idServicio"
        width={110}
        columnSorting={SIN_ORDEN_NI_MENU}
        dropdownMenu={false}
        renderer={CeldaFicha}
      />
    </HotTable>
  );
}

export default memo(HotServicios);
