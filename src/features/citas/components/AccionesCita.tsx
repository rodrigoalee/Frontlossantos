"use client";

import { useState, useTransition } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import AvisoAccion from "@/components/AvisoAccion";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
import { cambiarEstadoCita, cancelarMiCita } from "../actions";
import type { EstadoCita } from "../types";

export default function AccionesCita({
  idCita,
  estado,
  portal = false,
  puedeConfirmar = true,
}: {
  idCita: number;
  estado: EstadoCita;
  portal?: boolean;
  puedeConfirmar?: boolean;
}) {
  const [confirmando, setConfirmando] = useState<"Confirmada" | "Cancelada">();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function cambiar(nuevo: EstadoCita) {
    setError(undefined);
    startTransition(async () => {
      const resultado = await (portal ? cancelarMiCita(idCita) : cambiarEstadoCita(idCita, nuevo));
      setError(resultado?.error);
      setConfirmando(undefined);
    });
  }

  if (estado === "Cancelada") return null;

  return (
    <div className="flex flex-wrap gap-2 border-t border-base-300 pt-5">
      {estado === "Pendiente" && !portal && puedeConfirmar && (
        <button type="button" onClick={() => setConfirmando("Confirmada")} disabled={pending} className="btn btn-primary rounded-full px-6">
          <FaCheck aria-hidden className="size-3.5" />
          Confirmar cita
        </button>
      )}
      <button type="button" onClick={() => setConfirmando("Cancelada")} disabled={pending} className="btn rounded-full px-6 text-red-700">
        <FaXmark aria-hidden className="size-4" />
        Cancelar cita
      </button>

      {confirmando === "Confirmada" && (
        <ConfirmacionAccion
          titulo="¿Confirmar esta cita?"
          mensaje="El cliente recibirá el aviso por mensaje y correo."
          textoConfirmar="Sí, confirmar"
          textoCancelar="Volver"
          tono="primario"
          pendiente={pending}
          onConfirmar={() => cambiar("Confirmada")}
          onCancelar={() => setConfirmando(undefined)}
        />
      )}
      {confirmando === "Cancelada" && (
        <ConfirmacionAccion
          titulo="¿Cancelar esta cita?"
          mensaje="Después ya no se podrá reprogramar."
          textoConfirmar="Sí, cancelar"
          textoCancelar="Volver"
          pendiente={pending}
          onConfirmar={() => cambiar("Cancelada")}
          onCancelar={() => setConfirmando(undefined)}
        />
      )}
      {error && <AvisoAccion>{error}</AvisoAccion>}
    </div>
  );
}
