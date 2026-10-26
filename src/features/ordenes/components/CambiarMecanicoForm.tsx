"use client";

import { useState, useTransition } from "react";
import { cambiarMecanico } from "../actions";
import { describirCarga } from "../formato";
import type { MecanicoDisponible } from "../types";

export default function CambiarMecanicoForm({
  idOrden,
  actual,
  diagnostico,
  mecanicos,
}: {
  idOrden: number;
  actual: number | null;
  diagnostico: string | null;
  mecanicos: MecanicoDisponible[];
}) {
  const [seleccion, setSeleccion] = useState(actual ? String(actual) : "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const sinCambios = seleccion === (actual ? String(actual) : "");

  function guardar() {
    setError(undefined);
    startTransition(async () => {
      const resultado = await cambiarMecanico(idOrden, seleccion ? Number(seleccion) : null, diagnostico);
      setError(resultado?.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={seleccion}
          onChange={(evento) => setSeleccion(evento.target.value)}
          aria-label="Mecánico asignado"
          className="select grow rounded-full"
        >
          <option value="">Sin asignar</option>
          {mecanicos.map((mecanico) => (
            <option key={mecanico.idUsuario} value={mecanico.idUsuario}>
              {mecanico.nombreCompleto} · {describirCarga(mecanico.ordenesActivas)}
            </option>
          ))}
        </select>
        <button type="button" onClick={guardar} disabled={pending || sinCambios} className="btn rounded-full px-5">
          {pending && <span className="loading loading-spinner loading-xs" />}
          Reasignar
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
