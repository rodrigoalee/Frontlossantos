"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { useState, useTransition } from "react";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
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
      {confirmando && (
        <ConfirmacionAccion
          titulo={confirmando === "aceptar" ? "¿Aceptar la cotización?" : "¿Rechazar la cotización?"}
          mensaje={
            confirmando === "aceptar"
              ? `El trabajo cotizado suma ${formatearMoneda(total)}.`
              : "El taller no hará este trabajo."
          }
          textoConfirmar={confirmando === "aceptar" ? "Sí, aceptar" : "Sí, rechazar"}
          textoCancelar="Volver"
          tono={confirmando === "aceptar" ? "primario" : "neutro"}
          pendiente={pendiente}
          onConfirmar={() => responder(confirmando === "aceptar")}
          onCancelar={() => setConfirmando(undefined)}
        />
      )}
      <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" onClick={() => setConfirmando("aceptar")} className="btn btn-primary min-h-11 rounded-full px-6">
            Aceptar
          </button>
          <button type="button" onClick={() => setConfirmando("rechazar")} className="btn min-h-11 rounded-full px-6">
            Rechazar
          </button>
        </div>

      {error && (
        <AvisoAccion>
          {error}
        </AvisoAccion>
      )}
    </div>
  );
}
