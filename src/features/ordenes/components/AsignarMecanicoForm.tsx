"use client";

import { useState, useTransition } from "react";
import { FaUserGear } from "react-icons/fa6";
import AvisoAccion from "@/components/AvisoAccion";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
import { cambiarMecanico } from "../actions";
import { describirCarga } from "../formato";
import type { MecanicoDisponible } from "../types";

export default function AsignarMecanicoForm({
  idOrden,
  diagnostico,
  mecanicos,
}: {
  idOrden: number;
  diagnostico: string | null;
  mecanicos: MecanicoDisponible[];
}) {
  const [elegido, setElegido] = useState<MecanicoDisponible>();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function asignar() {
    if (!elegido) return;
    setError(undefined);
    startTransition(async () => {
      const resultado = await cambiarMecanico(idOrden, elegido.idUsuario, diagnostico);
      setConfirmando(false);
      setError(resultado?.error);
    });
  }

  if (mecanicos.length === 0) {
    return <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">No hay mecánicos en esta sede.</p>;
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        if (elegido) setConfirmando(true);
      }}
      className="flex flex-col gap-4"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-base-content/70">Elige un mecánico</legend>
        {mecanicos.map((mecanico) => (
          <label
            key={mecanico.idUsuario}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
              elegido?.idUsuario === mecanico.idUsuario ? "border-primary bg-primary/10" : "border-base-300 hover:bg-base-200/50"
            }`}
          >
            <input
              type="radio"
              name="mecanico"
              className="radio radio-primary radio-sm"
              checked={elegido?.idUsuario === mecanico.idUsuario}
              onChange={() => setElegido(mecanico)}
            />
            <span className="grow font-semibold text-secondary">{mecanico.nombreCompleto}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                mecanico.ordenesActivas === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {describirCarga(mecanico.ordenesActivas)}
            </span>
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={!elegido || pending} className="btn btn-primary self-start rounded-full px-6">
        <FaUserGear aria-hidden className="size-4" />
        Asignar mecánico
      </button>

      {confirmando && elegido && (
        <ConfirmacionAccion
          titulo={`¿Asignar a ${elegido.nombreCompleto}?`}
          mensaje="La orden aparecerá en su panel de trabajo."
          textoConfirmar="Sí, asignar"
          textoCancelar="Volver"
          tono="primario"
          pendiente={pending}
          onConfirmar={asignar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
      {error && <AvisoAccion>{error}</AvisoAccion>}
    </form>
  );
}
