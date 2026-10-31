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
import { formatearPlaca } from "@/features/vehiculos/formato";
import { formatearFechaCorta, PRESENTACION_ESTADO } from "../formato";
import type { CitaTaller } from "../types";

registerAllModules();
registerLanguageDictionary(esMX);

const MENU_FILTROS = ["filter_by_condition", "filter_by_value", "filter_action_bar"];
const SIN_ORDEN_NI_MENU = { indicator: false, headerAction: false };

const formatoHora24 = new Intl.DateTimeFormat("es-GT", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Guatemala",
});

/** "dd/mm/aaaa hh:mm" → número aaaammddhhmm, para ordenar por fecha y no como texto. */
function claveDeFecha(valor: unknown) {
  const [dia, mes, anio, hora, minuto] = String(valor ?? "").split(/[/\s:]/);
  return Number(`${anio}${mes}${dia}${hora}${minuto}`) || 0;
}

const ORDEN_POR_FECHA = {
  compareFunctionFactory: (orden: "asc" | "desc") => (a: unknown, b: unknown) => {
    const diferencia = claveDeFecha(a) - claveDeFecha(b);
    return orden === "asc" ? diferencia : -diferencia;
  },
};

const CLASES_ESTADO: Record<string, string> = {
  Programada: "bg-amber-100 text-amber-800",
  Confirmada: "bg-emerald-100 text-emerald-800",
  Cancelada: "bg-red-100 text-red-800",
};

function CeldaEstado({ value }: HotRendererProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASES_ESTADO[String(value)] ?? ""}`}>{value}</span>
  );
}

function CeldaVer({ value }: HotRendererProps) {
  return (
    <Link href={`/admin/citas/${value}`} className="font-semibold text-secondary underline-offset-2 hover:underline">
      Ver
    </Link>
  );
}

type Props = {
  citas: CitaTaller[];
  sedes: Map<number, string>;
  onConteo: (filas: number) => void;
};

function HotCitas({ citas, sedes, onConteo }: Props) {
  const filas = useMemo(
    () =>
      citas.map((cita) => ({
        idCita: cita.idCita,
        fecha: `${formatearFechaCorta(cita.fechaHora)} ${formatoHora24.format(new Date(cita.fechaHora))}`,
        nombreCliente: cita.nombreCliente,
        placa: formatearPlaca(cita.placa),
        servicio: cita.servicio ?? "Sin servicio",
        sede: sedes.get(cita.sucursalId) ?? "",
        estado: PRESENTACION_ESTADO[cita.estado].etiqueta,
        orden: cita.idOrden ? `#${cita.idOrden}` : "Sin orden",
      })),
    [citas, sedes],
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
      <HotColumn title="Fecha y hora" data="fecha" width={150} columnSorting={ORDEN_POR_FECHA} />
      <HotColumn title="Cliente" data="nombreCliente" width={200} />
      <HotColumn title="Placa" data="placa" width={110} />
      <HotColumn title="Servicio" data="servicio" width={180} />
      {sedes.size > 1 && <HotColumn title="Sede" data="sede" width={130} />}
      <HotColumn title="Estado" data="estado" width={120} renderer={CeldaEstado} />
      <HotColumn title="Orden" data="orden" width={100} />
      <HotColumn
        title="Detalle"
        data="idCita"
        width={90}
        columnSorting={SIN_ORDEN_NI_MENU}
        dropdownMenu={false}
        renderer={CeldaVer}
      />
    </HotTable>
  );
}

export default memo(HotCitas);
