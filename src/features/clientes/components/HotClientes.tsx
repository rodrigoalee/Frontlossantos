"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import "./tabla-clientes.css";
import { HotColumn, HotTable, type HotRendererProps } from "@handsontable/react-wrapper";
import esMX from "handsontable/i18n/languages/es-MX";
import { registerLanguageDictionary } from "handsontable/i18n";
import { registerAllModules } from "handsontable/registry";
import Link from "next/link";
import { memo, useMemo } from "react";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { formatearTelefono } from "../formato";
import type { ClienteConPlacas } from "../types";

registerAllModules();
registerLanguageDictionary(esMX);

const MENU_FILTROS = ["filter_by_condition", "filter_by_value", "filter_action_bar"];
const SIN_ORDEN_NI_MENU = { indicator: false, headerAction: false };

function CeldaFicha({ value }: HotRendererProps) {
  return (
    <Link href={`/admin/clientes/${value}`} className="font-semibold text-secondary underline-offset-2 hover:underline">
      Ver ficha
    </Link>
  );
}

type Props = {
  clientes: ClienteConPlacas[];
  conPlacas: boolean;
  onConteo: (filas: number) => void;
};

function HotClientes({ clientes, conPlacas, onConteo }: Props) {
  const filas = useMemo(
    () =>
      clientes.map((cliente) => ({
        ...cliente,
        telefonoVisible: formatearTelefono(cliente.telefono),
        placasVisibles: cliente.placas.map(formatearPlaca).join(", "),
      })),
    [clientes],
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
      <HotColumn title="Cliente" data="nombreCompleto" width={240} />
      <HotColumn title="Teléfono" data="telefonoVisible" width={160} />
      <HotColumn title="Correo" data="correo" width={240} />
      <HotColumn title="Vehículos" data="cantidadVehiculos" type="numeric" width={120} />
      {conPlacas && <HotColumn title="Placas" data="placasVisibles" width={200} />}
      <HotColumn
        title="Ficha"
        data="idCliente"
        width={110}
        columnSorting={SIN_ORDEN_NI_MENU}
        dropdownMenu={false}
        renderer={CeldaFicha}
      />
    </HotTable>
  );
}

export default memo(HotClientes);
