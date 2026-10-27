"use client";

import { useRef, useState, useTransition } from "react";
import { FaPaperPlane, FaPlus, FaTrash } from "react-icons/fa6";
import { formatearMoneda } from "@/features/citas/formato";
import { crearCotizacion } from "../actions";

const MAX_LINEAS = 20;
const CLASE_CAMPO = "input w-full border-0 bg-base-200";

type Fila = { id: number; descripcion: string; cantidad: string; precio: string };

const filaVacia = (id: number): Fila => ({ id, descripcion: "", cantidad: "1", precio: "" });

export default function NuevaCotizacionForm({ idOrden }: { idOrden: number }) {
  const siguienteId = useRef(1);
  const [abierto, setAbierto] = useState(false);
  const [filas, setFilas] = useState<Fila[]>(() => [filaVacia(0)]);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  const total = filas.reduce((suma, fila) => suma + (Number(fila.cantidad) || 0) * (Number(fila.precio) || 0), 0);

  function cambiar(id: number, campo: keyof Omit<Fila, "id">, valor: string) {
    setFilas((actuales) => actuales.map((fila) => (fila.id === id ? { ...fila, [campo]: valor } : fila)));
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const resultado = await crearCotizacion(
        idOrden,
        nota,
        filas.map((fila) => ({
          descripcion: fila.descripcion,
          cantidad: Number(fila.cantidad),
          precioUnitario: Number(fila.precio),
        })),
      );
      if (resultado?.error) {
        setError(resultado.error);
        return;
      }
      setFilas([filaVacia(siguienteId.current++)]);
      setNota("");
      setAbierto(false);
    });
  }

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className="btn btn-primary min-h-11 self-start rounded-full px-6">
        <FaPlus aria-hidden className="size-3" />
        Nueva cotización
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-2xl bg-base-200/40 p-4 sm:p-5">
      <p className="text-sm text-base-content/70">
        Describe el trabajo fuera del catálogo. El cliente la recibe por WhatsApp y la acepta desde su seguimiento.
      </p>

      <ul className="flex flex-col gap-3">
        {filas.map((fila, i) => (
          <li
            key={fila.id}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_5.5rem_8rem_auto] sm:items-end sm:bg-transparent sm:p-0"
          >
            <label className="col-span-3 sm:col-span-1">
              <span className="mb-1 block text-xs font-semibold">Concepto</span>
              <input
                value={fila.descripcion}
                onChange={(e) => cambiar(fila.id, "descripcion", e.target.value)}
                maxLength={200}
                required
                placeholder="Ej. Instalación de luces LED"
                aria-label={`Concepto de la línea ${i + 1}`}
                className={CLASE_CAMPO}
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold">Cantidad</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                value={fila.cantidad}
                onChange={(e) => cambiar(fila.id, "cantidad", e.target.value)}
                required
                className={CLASE_CAMPO}
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold">Precio (Q)</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={fila.precio}
                onChange={(e) => cambiar(fila.id, "precio", e.target.value)}
                required
                className={CLASE_CAMPO}
              />
            </label>
            <button
              type="button"
              onClick={() => setFilas((actuales) => actuales.filter((f) => f.id !== fila.id))}
              disabled={filas.length === 1}
              aria-label={`Quitar la línea ${i + 1}`}
              className="btn btn-ghost btn-square self-end text-error"
            >
              <FaTrash aria-hidden className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {filas.length < MAX_LINEAS && (
        <button type="button" onClick={() => setFilas((actuales) => [...actuales, filaVacia(siguienteId.current++)])} className="btn btn-sm self-start rounded-full px-4">
          <FaPlus aria-hidden className="size-3" />
          Agregar línea
        </button>
      )}

      <label>
        <span className="mb-1 block text-xs font-semibold">
          Nota para el cliente <span className="font-normal text-base-content/60">(opcional)</span>
        </span>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Ej. Incluye mano de obra; tiempo estimado: 2 días."
          className="textarea w-full border-0 bg-base-200"
        />
      </label>

      <div className="flex items-baseline justify-between border-t border-base-300 pt-3">
        <span className="text-sm text-base-content/70">Total a cotizar</span>
        <span className="text-lg font-bold text-secondary">{formatearMoneda(total)}</span>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => setAbierto(false)} disabled={pendiente} className="btn rounded-full px-6">
          Cancelar
        </button>
        <button type="submit" disabled={pendiente} className="btn btn-primary rounded-full px-6">
          {pendiente ? <span className="loading loading-spinner loading-sm" /> : <FaPaperPlane aria-hidden className="size-3.5" />}
          Enviar al cliente
        </button>
      </div>
    </form>
  );
}
