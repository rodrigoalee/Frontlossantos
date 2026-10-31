"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { useState, useTransition } from "react";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";

type ResultadoAccion = { error?: string } | undefined;

type Props = {
  activo: boolean;
  descripcionActivo: string;
  descripcionBaja: string;
  confirmacionBaja: string;
  darDeBaja?: () => Promise<ResultadoAccion>;
  reactivar?: () => Promise<ResultadoAccion>;
};

export default function EstadoCatalogo({
  activo,
  descripcionActivo,
  descripcionBaja,
  confirmacionBaja,
  darDeBaja,
  reactivar,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function ejecutar(accion: () => Promise<ResultadoAccion>) {
    startTransition(async () => {
      const resultado = await accion();
      setError(resultado?.error);
      setConfirmando(false);
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-secondary">Estado</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            activo ? "bg-emerald-100 text-emerald-800" : "bg-base-200 text-base-content/60"
          }`}
        >
          {activo ? "Activo" : "De baja"}
        </span>
      </div>

      <p className="text-sm text-base-content/70">{activo ? descripcionActivo : descripcionBaja}</p>

      {activo && darDeBaja && (
        <button
          type="button"
          onClick={() => {
            setError(undefined);
            setConfirmando(true);
          }}
          className="btn btn-sm self-start rounded-full px-5 text-error"
        >
          Dar de baja
        </button>
      )}

      {activo && darDeBaja && confirmando && (
        <ConfirmacionAccion
          titulo="¿Dar de baja?"
          mensaje={confirmacionBaja}
          textoConfirmar="Sí, dar de baja"
          textoCancelar="Volver"
          pendiente={pending}
          onConfirmar={() => ejecutar(darDeBaja)}
          onCancelar={() => setConfirmando(false)}
        />
      )}

      {!activo && reactivar && (
        <button
          type="button"
          onClick={() => ejecutar(reactivar)}
          disabled={pending}
          className="btn btn-primary btn-sm self-start rounded-full px-5"
        >
          {pending && <span className="loading loading-spinner loading-xs" />}
          Reactivar
        </button>
      )}

      {error && (
        <AvisoAccion>
          {error}
        </AvisoAccion>
      )}
    </section>
  );
}
