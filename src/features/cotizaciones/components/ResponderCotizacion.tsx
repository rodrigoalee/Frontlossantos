"use client";

import { useState, useTransition } from "react";
import { formatearMoneda } from "@/features/citas/formato";
import { responderCotizacion } from "../actions";

export default function ResponderCotizacion({ idCotizacion, total }: { idCotizacion: number; total: number }) {
  const [confirmando, setConfirmando] = useState<"aceptar" | "rechazar">();
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  function responder(aceptar: boolean) {
    setError(undefined);
    startTransition(async () => {
      const resultado = await responderCotizacion(idCotizacion, aceptar);
      setError(resultado?.error);
      setConfirmando(undefined);
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-base-300 pt-4">
      {confirmando ? (
        <div className={`flex flex-col gap-3 rounded-2xl p-4 ${confirmando === "aceptar" ? "bg-emerald-50" : "bg-base-200"}`}>
          <p className="text-sm">
            {confirmando === "aceptar"
              ? `Se agregarán ${formatearMoneda(total)} al trabajo de tu vehículo. ¿Confirmas?`
              : "El taller no hará este trabajo. ¿Confirmas que la rechazas?"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => responder(confirmando === "aceptar")}
              disabled={pendiente}
              className={`btn min-h-11 rounded-full px-6 ${confirmando === "aceptar" ? "btn-primary" : "btn-neutral"}`}
            >
              {pendiente && <span className="loading loading-spinner loading-sm" />}
              {confirmando === "aceptar" ? "Sí, aceptar" : "Sí, rechazar"}
            </button>
            <button type="button" onClick={() => setConfirmando(undefined)} disabled={pendiente} className="btn min-h-11 rounded-full px-6">
              Volver
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" onClick={() => setConfirmando("aceptar")} className="btn btn-primary min-h-11 rounded-full px-6">
            Aceptar
          </button>
          <button type="button" onClick={() => setConfirmando("rechazar")} className="btn min-h-11 rounded-full px-6">
            Rechazar
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
