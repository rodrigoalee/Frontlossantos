"use client";

import { useState, useTransition } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { eliminarVehiculo } from "../actions";

export default function EliminarVehiculoBoton({ idVehiculo, placa }: { idVehiculo: number; placa: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function eliminar() {
    startTransition(async () => {
      const resultado = await eliminarVehiculo(idVehiculo);
      setError(resultado?.error);
      setConfirmando(false);
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {confirmando ? (
        <div className="flex flex-wrap justify-center gap-1">
          <button type="button" onClick={eliminar} disabled={pending} className="btn btn-error btn-xs rounded-full">
            {pending && <span className="loading loading-spinner loading-xs" />}
            Eliminar
          </button>
          <button type="button" onClick={() => setConfirmando(false)} disabled={pending} className="btn btn-xs rounded-full">
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(undefined);
            setConfirmando(true);
          }}
          aria-label={`Eliminar vehículo ${placa}`}
          className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error"
        >
          <FaTrashCan aria-hidden className="size-3.5" />
        </button>
      )}
      {error && (
        <p role="alert" className="max-w-40 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
