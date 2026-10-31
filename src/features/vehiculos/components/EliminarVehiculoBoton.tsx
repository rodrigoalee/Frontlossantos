"use client";

import { useState, useTransition } from "react";
import { FaTrashCan } from "react-icons/fa6";
import AvisoAccion from "@/components/AvisoAccion";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
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
    <>
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
      {confirmando && (
        <ConfirmacionAccion
          titulo={`¿Eliminar el vehículo ${placa}?`}
          textoConfirmar="Sí, eliminar"
          textoCancelar="Volver"
          pendiente={pending}
          onConfirmar={eliminar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
      {error && <AvisoAccion>{error}</AvisoAccion>}
    </>
  );
}
