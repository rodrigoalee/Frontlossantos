"use client";

import { useState, useTransition } from "react";
import { FaFlagCheckered, FaPlay } from "react-icons/fa6";
import AvisoAccion from "@/components/AvisoAccion";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
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

  const empezar = estado === "EnRecepcion";

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setConfirmando(true)} disabled={pending} className="btn btn-primary rounded-full px-6">
        {empezar ? <FaPlay aria-hidden className="size-3" /> : <FaFlagCheckered aria-hidden className="size-3.5" />}
        {empezar ? "Empezar" : "Finalizar orden"}
      </button>
      {confirmando && (
        <ConfirmacionAccion
          titulo={empezar ? "¿Empezar el trabajo?" : "¿Finalizar la orden?"}
          mensaje={empezar ? "La orden pasará a En proceso." : "Ya no se podrán agregar ni quitar repuestos."}
          textoConfirmar={empezar ? "Sí, empezar" : "Sí, finalizar"}
          textoCancelar="Volver"
          tono={empezar ? "primario" : "exito"}
          pendiente={pending}
          onConfirmar={() => cambiar(empezar ? "EnProceso" : "Finalizado")}
          onCancelar={() => setConfirmando(false)}
        />
      )}
      {error && <AvisoAccion>{error}</AvisoAccion>}
    </div>
  );
}
