"use client";

import { useState, useTransition } from "react";
import { guardarDiagnostico } from "../actions";

export default function DiagnosticoOrden({ idOrden, inicial }: { idOrden: number; inicial: string | null }) {
  const [texto, setTexto] = useState(inicial ?? "");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string }>();
  const [pending, startTransition] = useTransition();
  const sinCambios = texto.trim() === (inicial ?? "").trim();

  function guardar() {
    setMensaje(undefined);
    startTransition(async () => {
      const resultado = await guardarDiagnostico(idOrden, texto);
      setMensaje(resultado?.error ? { tipo: "error", texto: resultado.error } : { tipo: "ok", texto: "Diagnóstico guardado." });
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Qué encontraste al revisar el vehículo."
        aria-label="Diagnóstico del mecánico"
        className="textarea w-full rounded-2xl"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={pending || sinCambios}
          className="btn btn-sm rounded-full px-5"
        >
          {pending && <span className="loading loading-spinner loading-xs" />}
          Guardar diagnóstico
        </button>
        {mensaje && (
          <p role={mensaje.tipo === "error" ? "alert" : "status"} className={`text-sm ${mensaje.tipo === "error" ? "text-error" : "text-emerald-700"}`}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </div>
  );
}
