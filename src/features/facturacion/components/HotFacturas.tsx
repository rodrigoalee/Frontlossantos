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
import { formatearFechaCorta, formatearMoneda } from "@/features/citas/formato";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { type FacturaLista, formaDePago } from "../types";

registerAllModules();
registerLanguageDictionary(esMX);

const MENU_FILTROS = ["filter_by_condition", "filter_by_value", "filter_action_bar"];
const SIN_ORDEN_NI_MENU = { indicator: false, headerAction: false };

/** "dd/mm/aaaa" → aaaammdd, para ordenar por fecha y no como texto. */
const ORDEN_POR_FECHA = {
  compareFunctionFactory: (orden: "asc" | "desc") => (a: unknown, b: unknown) => {
    const clave = (valor: unknown) => Number(String(valor ?? "").split("/").reverse().join("")) || 0;
    const diferencia = clave(a) - clave(b);
    return orden === "asc" ? diferencia : -diferencia;
  },
};

function CeldaTotal({ value }: HotRendererProps) {
  return <span className="font-semibold">{formatearMoneda(Number(value))}</span>;
}

function CeldaEstado({ value }: HotRendererProps) {
  const pagada = value === "Pagada";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        pagada ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {value}
    </span>
  );
}

function CeldaVer({ value }: HotRendererProps) {
  return (
    <Link href={`/admin/facturacion/${value}`} className="font-semibold text-secondary underline-offset-2 hover:underline">
      Ver
    </Link>
  );
}

function HotFacturas({ facturas, onConteo }: { facturas: FacturaLista[]; onConteo: (filas: number) => void }) {
  const filas = useMemo(
    () =>
      facturas.map((factura) => ({
        idFactura: factura.idFacturaEncabezado,
        numero: `#${factura.idFacturaEncabezado}`,
        fecha: formatearFechaCorta(factura.fechaEmision),
        cliente: factura.nombreFacturacion,
        nit: factura.nitFacturacion ?? "CF",
        placa: formatearPlaca(factura.placa),
        total: factura.totalPagado,
        estado: factura.estadoPago === "Pagado" ? "Pagada" : "Pendiente",
        forma: formaDePago(factura.estadoPago, factura.pagoConTarjeta),
      })),
    [facturas],
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
      <HotColumn title="Factura" data="numero" width={90} />
      <HotColumn title="Fecha" data="fecha" width={110} columnSorting={ORDEN_POR_FECHA} />
      <HotColumn title="Cliente" data="cliente" width={200} />
      <HotColumn title="NIT" data="nit" width={110} />
      <HotColumn title="Placa" data="placa" width={110} />
      <HotColumn title="Total" data="total" type="numeric" width={120} renderer={CeldaTotal} />
      <HotColumn title="Estado" data="estado" width={110} renderer={CeldaEstado} />
      <HotColumn title="Forma de pago" data="forma" width={140} />
      <HotColumn
        title="Detalle"
        data="idFactura"
        width={90}
        columnSorting={SIN_ORDEN_NI_MENU}
        dropdownMenu={false}
        renderer={CeldaVer}
      />
    </HotTable>
  );
}

export default memo(HotFacturas);
