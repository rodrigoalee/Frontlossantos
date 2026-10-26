"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { registrar } from "../actions";
import PasswordInput from "./PasswordInput";

const labelClass = "mb-1.5 block text-sm font-semibold";

const CAMPOS_DE_TEXTO = [
  {
    id: "nombreCompleto",
    etiqueta: "Nombre y Apellido",
    type: "text",
    autoComplete: "name",
    placeholder: "ingresar nombre...",
  },
  {
    id: "correo",
    etiqueta: "Correo electrónico",
    type: "email",
    autoComplete: "email",
    placeholder: "ingresar correo...",
  },
  {
    id: "telefono",
    etiqueta: "Teléfono",
    type: "tel",
    autoComplete: "tel",
    placeholder: "+50255551234",
  },
] as const;

export default function RegistroForm() {
  const [state, action, pending] = useActionState(registrar, undefined);

  return (
    <form action={action} className="card w-full max-w-xs border border-base-300 shadow-md">
      <div className="card-body gap-0 p-5">
        <h1 className="mb-6 text-center text-3xl font-bold text-secondary">Crear cuenta</h1>

        {CAMPOS_DE_TEXTO.map((campo) => (
          <div key={campo.id}>
            <label htmlFor={campo.id} className={labelClass}>
              {campo.etiqueta}
            </label>
            <input
              id={campo.id}
              name={campo.id}
              type={campo.type}
              placeholder={campo.placeholder}
              autoComplete={campo.autoComplete}
              defaultValue={state?.valores?.[campo.id]}
              required
              className="input mb-5 w-full border-0 bg-base-200"
            />
          </div>
        ))}

        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <PasswordInput id="password" name="password" autoComplete="new-password" />
        <p className="mt-1.5 text-xs text-base-content/60">Mínimo 12 caracteres.</p>

        <label htmlFor="confirmarPassword" className={`${labelClass} mt-5`}>
          Confirmar contraseña
        </label>
        <PasswordInput id="confirmarPassword" name="confirmarPassword" autoComplete="new-password" />

        {state?.error && (
          <p role="alert" className="mt-3 text-center text-sm text-error">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full rounded-full">
          {pending && <span className="loading loading-spinner loading-sm" />}
          Crear
        </button>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <FaArrowLeft className="size-3" /> Ya tengo cuenta
        </Link>
      </div>
    </form>
  );
}
