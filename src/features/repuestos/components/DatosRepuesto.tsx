"use client";

import { useActionState, useState } from "react";
import { FaPen } from "react-icons/fa6";
import { formatearMoneda } from "@/features/citas/formato";
import { actualizarRepuesto } from "../actions";
import type { Repuesto, RepuestoState } from "../types";
import CamposRepuesto from "./CamposRepuesto";

type EditorProps = {
  repuesto: Repuesto;
  onTerminar: () => void;
};

function EditorRepuesto({ repuesto, onTerminar }: EditorProps) {
  const [state, action, pending] = useActionState(
    async (prev: RepuestoState, formData: FormData) => {
      const resultado = await actualizarRepuesto(repuesto.idRepuesto, repuesto.activo, prev, formData);
      if (resultado?.ok) onTerminar();
      return resultado;
    },
    undefined,
  );
  const valores = state?.valores ?? {
    codigoStock: repuesto.codigoStock,
    nombre: repuesto.nombre,
    precioUnitario: repuesto.precioUnitario.toFixed(2),
  };

  return (
    <form action={action} className="flex flex-col gap-4">
      <CamposRepuesto valores={valores} compacto />
      {state?.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm rounded-full px-5">
          {pending && <span className="loading loading-spinner loading-xs" />}
          Guardar
        </button>
        <button type="button" onClick={onTerminar} disabled={pending} className="btn btn-sm rounded-full px-5">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function DatosRepuesto({ repuesto, puedeEditar }: { repuesto: Repuesto; puedeEditar: boolean }) {
  const [editando, setEditando] = useState(false);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-secondary">Datos del repuesto</h2>
        {puedeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label="Editar datos del repuesto"
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-secondary"
          >
            <FaPen aria-hidden className="size-3.5" />
          </button>
        )}
      </div>

      {editando ? (
        <EditorRepuesto repuesto={repuesto} onTerminar={() => setEditando(false)} />
      ) : (
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-sm font-semibold text-base-content/50">Código</dt>
            <dd className="font-semibold tracking-wide break-words text-secondary">{repuesto.codigoStock}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-base-content/50">Nombre</dt>
            <dd className="font-semibold break-words text-secondary">{repuesto.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-base-content/50">Precio unitario</dt>
            <dd className="font-semibold text-secondary tabular-nums">{formatearMoneda(repuesto.precioUnitario)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
