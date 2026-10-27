"use client";

import { useState, useTransition } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import AvisoAccion from "@/components/AvisoAccion";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
import { formatearMoneda } from "@/features/citas/formato";
import { registrarRespuestaCotizacion } from "../actions";

export default function RegistrarRespuestaCotizacion({ idCotizacion, total }: { idCotizacion: number; total: number }) {
  const [confirmando, setConfirmando] = useState<"aceptar" | "rechazar">();
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  function registrar(aceptar: boolean) {
    setError(undefined);
    startTransition(async () => {
      const resultado = await registrarRespuestaCotizacion(idCotizacion, aceptar);
      setConfirmando(undefined);
      setError(resultado?.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-base-content/60">
        El cliente puede responder desde su portal. Si está en el taller, registra aquí lo que decidió.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:flex">
        <button type="button" onClick={() => setConfirmando("aceptar")} disabled={pendiente} className="btn btn-primary rounded-full px-6">
          <FaCheck aria-hidden className="size-3.5" />
          El cliente aceptó
        </button>
        <button type="button" onClick={() => setConfirmando("rechazar")} disabled={pendiente} className="btn rounded-full px-6">
          <FaXmark aria-hidden className="size-4" />
          El cliente rechazó
        </button>
      </div>

      {confirmando && (
        <ConfirmacionAccion
          titulo={confirmando === "aceptar" ? "¿El cliente aceptó la cotización?" : "¿El cliente rechazó la cotización?"}
          mensaje={
            confirmando === "aceptar"
              ? `Se confirmará la cita por ${formatearMoneda(total)}.`
              : "La cita seguirá pendiente para enviar otra cotización o cancelarla."
          }
          textoConfirmar={confirmando === "aceptar" ? "Sí, aceptó" : "Sí, rechazó"}
          textoCancelar="Volver"
          tono={confirmando === "aceptar" ? "primario" : "neutro"}
          pendiente={pendiente}
          onConfirmar={() => registrar(confirmando === "aceptar")}
          onCancelar={() => setConfirmando(undefined)}
        />
      )}
      {error && <AvisoAccion>{error}</AvisoAccion>}
    </div>
  );
}
