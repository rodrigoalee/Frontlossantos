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
import type { UsuarioResumen } from "../types";

registerAllModules();
registerLanguageDictionary(esMX);

const MENU_FILTROS = ["filter_by_condition", "filter_by_value", "filter_action_bar"];
const SIN_ORDEN_NI_MENU = { indicator: false, headerAction: false };

function CeldaEstado({ value }: HotRendererProps) {
  const activo = value === "Activo";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        activo ? "bg-emerald-100 text-emerald-800" : "bg-base-300 text-base-content/70"
      }`}
    >
      {value}
    </span>
  );
}

function CeldaGestionar({ value }: HotRendererProps) {
  return (
    <Link
      href={`/admin/ajustes?gestionar=${value}`}
      scroll={false}
      className="font-semibold text-secondary underline-offset-2 hover:underline"
    >
      Gestionar
    </Link>
  );
}

type Props = {
  usuarios: UsuarioResumen[];
  onConteo: (filas: number) => void;
};

function HotUsuarios({ usuarios, onConteo }: Props) {
  const filas = useMemo(
    () =>
      usuarios.map((usuario) => ({
        ...usuario,
        rolVisible: usuario.rol ?? "Sin rol",
        sedeVisible: usuario.sucursal ?? "Todas las sedes",
        estadoVisible: usuario.activo ? "Activo" : "Inactivo",
      })),
    [usuarios],
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
      height={520}
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
      <HotColumn title="Nombre" data="nombreCompleto" width={220} />
      <HotColumn title="Correo" data="correo" width={240} />
      <HotColumn title="Rol" data="rolVisible" width={160} />
      <HotColumn title="Sede" data="sedeVisible" width={150} />
      <HotColumn title="Estado" data="estadoVisible" width={110} renderer={CeldaEstado} />
      <HotColumn
        title="Acciones"
        data="idUsuario"
        width={120}
        columnSorting={SIN_ORDEN_NI_MENU}
        dropdownMenu={false}
        renderer={CeldaGestionar}
      />
    </HotTable>
  );
}

export default memo(HotUsuarios);
