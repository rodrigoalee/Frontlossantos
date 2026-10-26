"use client";

import { useState, useTransition } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { cambiarEstadoCita } from "../actions";
import type { EstadoCita } from "../types";

export default function AccionesCita({ idCita, estado }: { idCita: number; estado: EstadoCita }) {
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function cambiar(nuevo: EstadoCita) {
    setError(undefined);
    startTransition(async () => {
      const resultado = await cambiarEstadoCita(idCita, nuevo);
      setError(resultado?.error);
      setConfirmandoCancelacion(false);
    });
  }

  if (estado === "Cancelada") return null;

  return (
    <div className="flex flex-col gap-3 border-t border-base-300 pt-5">
      {confirmandoCancelacion ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-red-50 p-4">
          <p className="text-sm text-red-800">
            ¿Seguro que quieres cancelar esta cita? Después ya no se podrá reprogramar.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cambiar("Cancelada")}
              disabled={pending}
              className="btn btn-error btn-sm rounded-full px-5"
            >
              {pending && <span className="loading loading-spinner loading-xs" />}
              Sí, cancelar cita
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoCancelacion(false)}
              disabled={pending}
              className="btn btn-sm rounded-full px-5"
            >
              No, volver
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {estado === "Pendiente" && (
            <button
              type="button"
              onClick={() => cambiar("Confirmada")}
              disabled={pending}
              className="btn btn-primary rounded-full px-6"
            >
              {pending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FaCheck aria-hidden className="size-3.5" />
              )}
              Confirmar cita
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmandoCancelacion(true)}
            disabled={pending}
            className="btn rounded-full px-6 text-red-700"
          >
            <FaXmark aria-hidden className="size-4" />
            Cancelar cita
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
