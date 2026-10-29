"use client";

import { useState, useTransition } from "react";
import { FaCarSide } from "react-icons/fa6";
import AvisoAccion from "@/components/AvisoAccion";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
import { abrirOrden } from "../actions";

export default function RecibirVehiculoForm({ citaId }: { citaId: number }) {
  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function recibir() {
    setError(undefined);
    startTransition(async () => {
      const resultado = await abrirOrden(citaId, motivo.trim() || null);
      setConfirmando(false);
      setError(resultado?.error);
    });
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        setConfirmando(true);
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-base-content/70">Lo que reporta el cliente</span>
        <textarea
          value={motivo}
          onChange={(evento) => setMotivo(evento.target.value)}
          maxLength={1000}
          rows={3}
          className="textarea w-full rounded-2xl"
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary self-start rounded-full px-6">
        <FaCarSide aria-hidden className="size-4" />
        Recibir vehículo
      </button>

      {confirmando && (
        <ConfirmacionAccion
          titulo="¿El vehículo ya llegó?"
          mensaje="Se abrirá la orden y el cliente recibirá el aviso por mensaje y correo."
          textoConfirmar="Sí, recibir"
          textoCancelar="Volver"
          tono="primario"
          pendiente={pending}
          onConfirmar={recibir}
          onCancelar={() => setConfirmando(false)}
        />
      )}
      {error && <AvisoAccion>{error}</AvisoAccion>}
    </form>
  );
}
