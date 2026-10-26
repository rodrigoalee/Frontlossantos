"use client";

import { useState, useTransition } from "react";
import { FaPlus } from "react-icons/fa6";
import { formatearMoneda } from "@/features/citas/formato";
import { agregarLinea } from "../actions";
import type { RepuestoInventario, ServicioCatalogo } from "../types";

type Tipo = "repuesto" | "servicio";

export default function AgregarLineaForm({
  idOrden,
  repuestos,
  servicios,
}: {
  idOrden: number;
  repuestos: RepuestoInventario[];
  servicios: ServicioCatalogo[];
}) {
  const [tipo, setTipo] = useState<Tipo>("repuesto");
  const [seleccion, setSeleccion] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function cambiarTipo(nuevo: Tipo) {
    setTipo(nuevo);
    setSeleccion("");
    setCantidad(1);
    setError(undefined);
  }

  function agregar(evento: React.FormEvent) {
    evento.preventDefault();
    const id = Number(seleccion);
    if (!id) {
      setError(tipo === "repuesto" ? "Elige un repuesto." : "Elige un servicio.");
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const resultado = await agregarLinea(idOrden, {
        repuestoId: tipo === "repuesto" ? id : null,
        servicioId: tipo === "servicio" ? id : null,
        cantidad,
      });
      if (resultado?.error) {
        setError(resultado.error);
        return;
      }
      setSeleccion("");
      setCantidad(1);
    });
  }

  return (
    <form onSubmit={agregar} className="flex flex-col gap-3 rounded-2xl bg-base-200/40 p-4">
      <div role="tablist" className="tabs tabs-box w-fit rounded-full">
        {(["repuesto", "servicio"] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            role="tab"
            aria-selected={tipo === opcion}
            onClick={() => cambiarTipo(opcion)}
            className={`tab rounded-full ${tipo === opcion ? "tab-active" : ""}`}
          >
            {opcion === "repuesto" ? "Repuesto" : "Servicio"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={seleccion}
          onChange={(evento) => setSeleccion(evento.target.value)}
          aria-label={tipo === "repuesto" ? "Repuesto" : "Servicio"}
          className="select grow rounded-full"
        >
          <option value="">{tipo === "repuesto" ? "Elige un repuesto…" : "Elige un servicio…"}</option>
          {tipo === "repuesto"
            ? repuestos.map((repuesto) => (
                <option key={repuesto.repuestoId} value={repuesto.repuestoId} disabled={repuesto.cantidad === 0}>
                  {repuesto.nombre} · {formatearMoneda(repuesto.precioUnitario)} · {repuesto.cantidad} en bodega
                </option>
              ))
            : servicios.map((servicio) => (
                <option key={servicio.idServicio} value={servicio.idServicio}>
                  {servicio.nombre} · {formatearMoneda(servicio.tarifaManoObra)}
                </option>
              ))}
        </select>
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(evento) => setCantidad(Math.max(1, Math.floor(Number(evento.target.value) || 1)))}
          aria-label="Cantidad"
          className="input w-full rounded-full sm:w-24"
        />
        <button type="submit" disabled={pending} className="btn btn-primary rounded-full px-5">
          {pending ? <span className="loading loading-spinner loading-sm" /> : <FaPlus aria-hidden className="size-3" />}
          Agregar
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </form>
  );
}
