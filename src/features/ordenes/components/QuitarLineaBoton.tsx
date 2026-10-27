"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { useState, useTransition } from "react";
import { FaXmark } from "react-icons/fa6";
import { quitarLinea } from "../actions";

export default function QuitarLineaBoton({
  idOrden,
  idLinea,
  descripcion,
}: {
  idOrden: number;
  idLinea: number;
  descripcion: string;
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function quitar() {
    setError(undefined);
    startTransition(async () => {
      const resultado = await quitarLinea(idOrden, idLinea);
      setError(resultado?.error);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={quitar}
        disabled={pending}
        aria-label={`Quitar ${descripcion}`}
        className="btn btn-ghost btn-xs btn-circle text-red-700"
      >
        {pending ? <span className="loading loading-spinner loading-xs" /> : <FaXmark aria-hidden className="size-3.5" />}
      </button>
      {error && (
        <AvisoAccion>
          {error}
        </AvisoAccion>
      )}
    </>
  );
}
