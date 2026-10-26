"use client";

import { useState, useTransition } from "react";
import { abrirOrden } from "../actions";
import { describirCarga } from "../formato";
import type { MecanicoDisponible } from "../types";

export default function AbrirOrdenForm({ citaId, mecanicos }: { citaId: number; mecanicos: MecanicoDisponible[] }) {
  const [mecanico, setMecanico] = useState<number | null>(mecanicos[0]?.idUsuario ?? null);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const resultado = await abrirOrden({
        citaId,
        mecanicoAsignadoId: mecanico,
        motivoIngreso: motivo.trim() || null,
      });
      setError(resultado?.error);
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-base-content/70">Lo que reporta el cliente</span>
        <textarea
          value={motivo}
          onChange={(evento) => setMotivo(evento.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Ej. Hace ruido al frenar, revisar también las luces."
          className="textarea w-full rounded-2xl"
        />
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold text-base-content/70">Asignar mecánico</legend>
        {mecanicos.length === 0 ? (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            No hay mecánicos en esta sede. Puedes abrir la orden sin asignar y hacerlo después.
          </p>
        ) : (
          mecanicos.map((m) => (
            <label
              key={m.idUsuario}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                mecanico === m.idUsuario ? "border-primary bg-primary/10" : "border-base-300 hover:bg-base-200/50"
              }`}
            >
              <input
                type="radio"
                name="mecanico"
                className="radio radio-primary radio-sm"
                checked={mecanico === m.idUsuario}
                onChange={() => setMecanico(m.idUsuario)}
              />
              <span className="grow font-semibold text-secondary">{m.nombreCompleto}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  m.ordenesActivas === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {describirCarga(m.ordenesActivas)}
              </span>
            </label>
          ))
        )}
        {mecanicos.length > 0 && (
          <label className="flex cursor-pointer items-center gap-3 px-4 text-sm text-base-content/60">
            <input
              type="radio"
              name="mecanico"
              className="radio radio-sm"
              checked={mecanico === null}
              onChange={() => setMecanico(null)}
            />
            Asignar después
          </label>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary self-start rounded-full px-8">
        {pending && <span className="loading loading-spinner loading-sm" />}
        Abrir orden
      </button>
    </form>
  );
}
