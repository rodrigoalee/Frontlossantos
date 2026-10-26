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
import type { Repuesto } from "../types";

registerAllModules();
registerLanguageDictionary(esMX);

const MENU_FILTROS = ["filter_by_condition", "filter_by_value", "filter_action_bar"];
const SIN_ORDEN_NI_MENU = { indicator: false, headerAction: false };

function CeldaPrecio({ value }: HotRendererProps) {
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
    <Link href={`/admin/repuestos/${value}`} className="font-semibold text-secondary underline-offset-2 hover:underline">
      Ver ficha
    </Link>
  );
}

type Props = {
  repuestos: Repuesto[];
  onConteo: (filas: number) => void;
};

function HotRepuestos({ repuestos, onConteo }: Props) {
  const filas = useMemo(
    () => repuestos.map((repuesto) => ({ ...repuesto, estado: repuesto.activo ? "Activo" : "De baja" })),
    [repuestos],
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
      <HotColumn title="Código" data="codigoStock" width={150} />
      <HotColumn title="Repuesto" data="nombre" width={280} />
      <HotColumn title="Precio" data="precioUnitario" type="numeric" width={140} renderer={CeldaPrecio} />
      <HotColumn title="Estado" data="estado" width={120} renderer={CeldaEstado} />
      <HotColumn
        title="Ficha"
        data="idRepuesto"
        width={110}
        columnSorting={SIN_ORDEN_NI_MENU}
        dropdownMenu={false}
        renderer={CeldaFicha}
      />
    </HotTable>
  );
}

export default memo(HotRepuestos);
