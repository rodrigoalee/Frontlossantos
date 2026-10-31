"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { useActionState, useState } from "react";
import { FaPen } from "react-icons/fa6";
import { formatearMoneda } from "@/features/citas/formato";
import { actualizarServicio } from "../actions";
import type { ServicioCatalogo, ServicioState } from "../types";
import CamposServicio from "./CamposServicio";

type EditorProps = {
  servicio: ServicioCatalogo;
  onTerminar: () => void;
};

function EditorServicio({ servicio, onTerminar }: EditorProps) {
  const [state, action, pending] = useActionState(
    async (prev: ServicioState, formData: FormData) => {
      const resultado = await actualizarServicio(servicio.idServicio, servicio.activo, prev, formData);
      if (resultado?.ok) onTerminar();
      return resultado;
    },
    undefined,
  );
  const valores = state?.valores ?? {
    nombre: servicio.nombre,
    tarifaManoObra: servicio.tarifaManoObra.toFixed(2),
  };

  return (
    <form action={action} className="flex flex-col gap-4">
      <CamposServicio valores={valores} compacto />
      {state?.error && (
        <AvisoAccion origen={state}>
          {state.error}
        </AvisoAccion>
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

export default function DatosServicio({ servicio, puedeEditar }: { servicio: ServicioCatalogo; puedeEditar: boolean }) {
  const [editando, setEditando] = useState(false);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-secondary">Datos del servicio</h2>
        {puedeEditar && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label="Editar datos del servicio"
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-secondary"
          >
            <FaPen aria-hidden className="size-3.5" />
          </button>
        )}
      </div>

      {editando ? (
        <EditorServicio servicio={servicio} onTerminar={() => setEditando(false)} />
      ) : (
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-sm font-semibold text-base-content/50">Nombre</dt>
            <dd className="font-semibold break-words text-secondary">{servicio.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-base-content/50">Tarifa de mano de obra</dt>
            <dd className="font-semibold text-secondary tabular-nums">{formatearMoneda(servicio.tarifaManoObra)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
