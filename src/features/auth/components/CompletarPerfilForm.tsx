"use client";

import { useActionState } from "react";
import { completarPerfil } from "../actions";

export default function CompletarPerfilForm() {
  const [state, action, pending] = useActionState(completarPerfil, undefined);

  return (
    <form action={action}>
      <label htmlFor="telefono" className="mb-1.5 block text-sm font-semibold">
        Teléfono
      </label>
      <input
        id="telefono"
        name="telefono"
        type="tel"
        placeholder="+50241961558"
        autoComplete="tel"
        defaultValue={state?.telefono ?? "+502"}
        pattern="\+[1-9][\d\s\-]{7,18}"
        title="Incluye el código de país, por ejemplo +50241961558."
        required
        className="input w-full border-0 bg-base-200"
      />

      {state?.error && (
        <p role="alert" className="mt-3 text-center text-sm text-error">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full rounded-full">
        {pending && <span className="loading loading-spinner loading-sm" />}
        Guardar
      </button>
    </form>
  );
}
