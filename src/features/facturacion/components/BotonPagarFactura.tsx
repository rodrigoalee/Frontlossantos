"use client";

import { useState, useTransition } from "react";
import { FaCreditCard } from "react-icons/fa6";
import { formatearMoneda } from "@/features/citas/formato";
import { irAPagar } from "../actions";

export default function BotonPagarFactura({ idFactura, total }: { idFactura: number; total: number }) {
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          startTransition(async () => {
            setError((await irAPagar(idFactura)).error);
          })
        }
        className="btn btn-primary min-h-11 rounded-full px-6"
      >
        {pendiente ? <span className="loading loading-spinner loading-sm" /> : <FaCreditCard aria-hidden className="size-4" />}
        Pagar {formatearMoneda(total)}
      </button>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
