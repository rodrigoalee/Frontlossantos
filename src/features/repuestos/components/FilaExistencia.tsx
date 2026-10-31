"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { useActionState, useState } from "react";
import { FaPen } from "react-icons/fa6";
import { fijarExistencia } from "../actions";
import type { ExistenciaSede, RepuestoState } from "../types";

const CELDA = "border-l border-base-300 px-3 py-3 first:border-l-0";

type Props = {
  existencia: ExistenciaSede;
  idRepuesto: number;
  puedeAjustar: boolean;
};

type EditorProps = Omit<Props, "puedeAjustar"> & {
  onTerminar: () => void;
};

function EditorExistencia({ existencia, idRepuesto, onTerminar }: EditorProps) {
  const [state, action, pending] = useActionState(
    async (prev: RepuestoState, formData: FormData) => {
      const resultado = await fijarExistencia(existencia.idSucursal, idRepuesto, prev, formData);
      if (resultado?.ok) onTerminar();
      return resultado;
    },
    undefined,
  );

  return (
    <tr className="bg-base-200/60 align-top">
      <td className={`${CELDA} font-semibold text-secondary`}>{existencia.sede}</td>
      <td className={CELDA} colSpan={2}>
        <form action={action} className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="cantidad"
              type="number"
              inputMode="numeric"
              aria-label={`Existencias en ${existencia.sede}`}
              min={0}
              step={1}
              required
              autoFocus
              defaultValue={state?.valores?.cantidad ?? existencia.cantidad}
              className="input input-sm w-28 border-0 bg-base-100 text-right"
            />
            <button type="submit" disabled={pending} className="btn btn-primary btn-xs rounded-full px-3">
              {pending && <span className="loading loading-spinner loading-xs" />}
              Guardar
            </button>
            <button type="button" onClick={onTerminar} disabled={pending} className="btn btn-xs rounded-full px-3">
              Cancelar
            </button>
          </div>
          <p className="text-xs text-base-content/60">Escribe lo que contaste en bodega, no la diferencia.</p>
          {state?.error && (
            <AvisoAccion origen={state}>
              {state.error}
            </AvisoAccion>
          )}
        </form>
      </td>
    </tr>
  );
}

export default function FilaExistencia({ existencia, idRepuesto, puedeAjustar }: Props) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return <EditorExistencia existencia={existencia} idRepuesto={idRepuesto} onTerminar={() => setEditando(false)} />;
  }

  const agotado = existencia.cantidad === 0;

  return (
    <tr className="transition-colors hover:bg-base-200/60">
      <td className={`${CELDA} font-semibold text-secondary`}>{existencia.sede}</td>
      <td className={`${CELDA} text-right font-semibold tabular-nums ${agotado ? "text-error" : "text-base-content/70"}`}>
        {agotado ? "Agotado" : existencia.cantidad}
      </td>
      {puedeAjustar && (
        <td className={`${CELDA} w-14 text-center`}>
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label={`Ajustar existencias en ${existencia.sede}`}
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-secondary"
          >
            <FaPen aria-hidden className="size-3" />
          </button>
        </td>
      )}
    </tr>
  );
}
