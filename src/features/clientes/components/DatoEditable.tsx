"use client";

import { useActionState, useState } from "react";
import { FaPen } from "react-icons/fa6";
import { actualizarCliente } from "../actions";
import type { EditarClienteState } from "../types";

export type DatosCliente = {
  nombreCompleto: string;
  telefono: string;
  correo: string;
  nit: string;
};

type Props = {
  idCliente: number;
  cliente: DatosCliente;
  campo: keyof DatosCliente;
  etiqueta: string;
  tipo?: "text" | "tel" | "email";
  maxLength: number;
  ayuda?: string;
  puedeEditar: boolean;
  children: React.ReactNode;
};

type EditorProps = Omit<Props, "puedeEditar" | "children"> & {
  onTerminar: () => void;
};

function EditorDato({ idCliente, cliente, campo, etiqueta, tipo = "text", maxLength, ayuda, onTerminar }: EditorProps) {
  const [state, action, pending] = useActionState(
    async (prev: (EditarClienteState & { valor?: string }) | undefined, formData: FormData) => {
      const resultado = await actualizarCliente(idCliente, prev, formData);
      if (resultado?.ok) onTerminar();
      return { ...resultado, valor: String(formData.get(campo) ?? "") };
    },
    undefined,
  );
  const id = `editar-${campo}`;

  return (
    <>
      <dt className="text-sm font-semibold text-base-content/50">
        <label htmlFor={id}>{etiqueta}</label>
      </dt>
      <dd>
        <form action={action} className="mt-1 flex flex-col gap-2">
          <input type="hidden" name="campo" value={campo} />
          {(Object.keys(cliente) as (keyof DatosCliente)[])
            .filter((otro) => otro !== campo)
            .map((otro) => (
              <input key={otro} type="hidden" name={otro} value={cliente[otro]} />
            ))}
          <input
            id={id}
            name={campo}
            type={tipo}
            maxLength={maxLength}
            required={campo !== "nit"}
            defaultValue={state?.valor ?? cliente[campo]}
            autoFocus
            className="input input-sm w-full border-0 bg-base-200"
          />
          {ayuda && <p className="text-xs text-base-content/60">{ayuda}</p>}
          {state?.error && (
            <p role="alert" className="text-xs text-error">
              {state.error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn btn-primary btn-xs rounded-full px-4">
              {pending && <span className="loading loading-spinner loading-xs" />}
              Guardar
            </button>
            <button type="button" onClick={onTerminar} disabled={pending} className="btn btn-xs rounded-full px-4">
              Cancelar
            </button>
          </div>
        </form>
      </dd>
    </>
  );
}

export default function DatoEditable({ puedeEditar, children, ...editor }: Props) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div>
        <EditorDato {...editor} onTerminar={() => setEditando(false)} />
      </div>
    );
  }

  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{editor.etiqueta}</dt>
      <dd className="flex items-start justify-between gap-2">
        <span className="min-w-0 font-semibold break-words text-secondary">{children}</span>
        {puedeEditar && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label={`Editar ${editor.etiqueta.toLowerCase()}`}
            className="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/50 hover:text-secondary"
          >
            <FaPen aria-hidden className="size-3" />
          </button>
        )}
      </dd>
    </div>
  );
}
