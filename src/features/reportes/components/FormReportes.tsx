"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FaBoxesStacked, FaCalendarDays, FaClipboardList, FaFileExcel, FaFilePdf, FaFileInvoiceDollar } from "react-icons/fa6";
import AvisoAccion from "@/components/AvisoAccion";
import type { Sucursal } from "@/features/citas/types";

type Tipo = "ventas" | "ordenes" | "inventario" | "citas";
type Formato = "excel" | "pdf";

const REPORTES: { tipo: Tipo; titulo: string; Icono: IconType }[] = [
  { tipo: "ventas", titulo: "Ventas", Icono: FaFileInvoiceDollar },
  { tipo: "ordenes", titulo: "Órdenes", Icono: FaClipboardList },
  { tipo: "citas", titulo: "Citas", Icono: FaCalendarDays },
  { tipo: "inventario", titulo: "Inventario", Icono: FaBoxesStacked },
];

const CLASE_CAMPO = "input w-full border-0 bg-base-200";

function fechaLocal(fecha: Date) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function nombreArchivo(cabecera: string | null, respaldo: string) {
  return cabecera?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1] ?? respaldo;
}

export default function FormReportes({ sucursales }: { sucursales: Sucursal[] }) {
  const hoy = new Date();
  const [tipo, setTipo] = useState<Tipo>("ventas");
  const [desde, setDesde] = useState(() => fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
  const [hasta, setHasta] = useState(() => fechaLocal(hoy));
  const [sucursalId, setSucursalId] = useState("");
  const [descargando, setDescargando] = useState<Formato>();
  const [error, setError] = useState<string>();

  const conFechas = tipo !== "inventario";

  async function descargar(formato: Formato) {
    if (conFechas && desde > hasta) {
      setError("La fecha final no puede ser anterior a la inicial.");
      return;
    }

    setError(undefined);
    setDescargando(formato);
    const parametros = new URLSearchParams({ tipo, formato });
    if (conFechas) {
      parametros.set("desde", desde);
      parametros.set("hasta", hasta);
    }
    if (sucursalId) parametros.set("sucursalId", sucursalId);

    try {
      const respuesta = await fetch(`/admin/reportes/descargar?${parametros}`);
      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => undefined);
        setError(cuerpo?.error ?? "No se pudo generar el reporte. Intenta más tarde.");
        return;
      }
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(await respuesta.blob());
      enlace.download = nombreArchivo(respuesta.headers.get("content-disposition"), `reporte-${tipo}`);
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setDescargando(undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-base-content/70">Reporte</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {REPORTES.map(({ tipo: valor, titulo, Icono }) => (
            <label
              key={valor}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${
                tipo === valor ? "border-primary bg-primary/10" : "border-base-300 hover:bg-base-200/50"
              }`}
            >
              <input type="radio" name="tipo" className="sr-only" checked={tipo === valor} onChange={() => setTipo(valor)} />
              <Icono aria-hidden className="size-6 text-secondary" />
              <span className="font-semibold text-secondary">{titulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {conFechas && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Desde</span>
              <input type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className={CLASE_CAMPO} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Hasta</span>
              <input type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} className={CLASE_CAMPO} />
            </label>
          </>
        )}
        {sucursales.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Sede</span>
            <select value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} className="select w-full border-0 bg-base-200">
              <option value="">Todas las sedes</option>
              {sucursales.map((s) => (
                <option key={s.idSucursal} value={s.idSucursal}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {!conFechas && <p className="-mt-2 text-sm text-base-content/60">Muestra las existencias actuales de cada repuesto.</p>}

      <div className="grid grid-cols-1 gap-3 sm:flex sm:justify-end">
        <button type="button" onClick={() => descargar("excel")} disabled={!!descargando} className="btn btn-success rounded-full px-6">
          {descargando === "excel" ? <span className="loading loading-spinner loading-sm" /> : <FaFileExcel aria-hidden className="size-4" />}
          Descargar Excel
        </button>
        <button type="button" onClick={() => descargar("pdf")} disabled={!!descargando} className="btn btn-error rounded-full px-6">
          {descargando === "pdf" ? <span className="loading loading-spinner loading-sm" /> : <FaFilePdf aria-hidden className="size-4" />}
          Descargar PDF
        </button>
      </div>

      {error && <AvisoAccion>{error}</AvisoAccion>}
    </div>
  );
}
