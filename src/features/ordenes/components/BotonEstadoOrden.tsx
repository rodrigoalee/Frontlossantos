"use client";

import { useState, useTransition } from "react";
import { FaFlagCheckered, FaPlay } from "react-icons/fa6";
import { cambiarEstadoOrden } from "../actions";
import type { EstadoOrden } from "../types";

export default function BotonEstadoOrden({ idOrden, estado }: { idOrden: number; estado: EstadoOrden }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function cambiar(nuevo: EstadoOrden) {
    setError(undefined);
    startTransition(async () => {
      const resultado = await cambiarEstadoOrden(idOrden, nuevo);
      setError(resultado?.error);
      setConfirmando(false);
    });
  }

  if (estado === "Finalizado") return null;

  return (
    <div className="flex flex-col gap-2">
      {estado === "EnRecepcion" && (
        <button
          type="button"
          onClick={() => cambiar("EnProceso")}
          disabled={pending}
          className="btn btn-primary rounded-full px-6"
        >
          {pending ? <span className="loading loading-spinner loading-sm" /> : <FaPlay aria-hidden className="size-3" />}
          Empezar
        </button>
      )}
      {estado === "EnProceso" &&
        (confirmando ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-900">
              ¿Terminaste el trabajo? Al finalizar ya no se podrán agregar ni quitar repuestos.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => cambiar("Finalizado")}
                disabled={pending}
                className="btn btn-success btn-sm rounded-full px-5"
              >
                {pending && <span className="loading loading-spinner loading-xs" />}
                Sí, finalizar
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                disabled={pending}
                className="btn btn-sm rounded-full px-5"
              >
                No, volver
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmando(true)} className="btn btn-primary rounded-full px-6">
            <FaFlagCheckered aria-hidden className="size-3.5" />
            Finalizar orden
          </button>
        ))}
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
