"use client";

import AvisoAccion from "@/components/AvisoAccion";
import Link from "next/link";
import { useActionState } from "react";
import { alSalirDelTelefono } from "@/lib/validaciones";
import { crearCliente } from "../actions";

const CAMPOS = [
  { name: "nombreCompleto", label: "Nombre completo", type: "text", maxLength: 150, required: true, autoComplete: "name" },
  {
    name: "telefono",
    label: "Teléfono",
    type: "tel",
    maxLength: 20,
    required: true,
    autoComplete: "tel",
  },
  { name: "correo", label: "Correo", type: "email", maxLength: 100, required: true, autoComplete: "email" },
  { name: "nit", label: "NIT (opcional)", type: "text", maxLength: 20, required: false, autoComplete: "off" },
] as const;

export default function NuevoClienteForm() {
  const [state, action, pending] = useActionState(crearCliente, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {CAMPOS.map((campo) => (
          <div key={campo.name}>
            <label htmlFor={campo.name} className="mb-1.5 block text-sm font-semibold">
              {campo.label}
            </label>
            <input
              id={campo.name}
              name={campo.name}
              type={campo.type}
              maxLength={campo.maxLength}
              required={campo.required}
              autoComplete={campo.autoComplete}
              defaultValue={state?.valores?.[campo.name]}
              onBlur={campo.name === "telefono" ? alSalirDelTelefono : undefined}
              className="input w-full border-0 bg-base-200"
            />
            {"ayuda" in campo && <p className="mt-1.5 text-xs text-base-content/60">{campo.ayuda}</p>}
          </div>
        ))}
      </div>

      {state?.error && (
        <AvisoAccion origen={state}>
          {state.error}
        </AvisoAccion>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/admin/clientes" className="btn rounded-full px-6">
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className="btn btn-primary rounded-full px-8">
          {pending && <span className="loading loading-spinner loading-sm" />}
          Registrar cliente
        </button>
      </div>
    </form>
  );
}
