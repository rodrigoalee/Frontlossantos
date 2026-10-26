"use client";

import Link from "next/link";
import { useActionState } from "react";
import { crearServicio } from "../actions";
import CamposServicio from "./CamposServicio";

export default function NuevoServicioForm() {
  const [state, action, pending] = useActionState(crearServicio, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <CamposServicio valores={state?.valores} />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/admin/servicios" className="btn rounded-full px-6">
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className="btn btn-primary rounded-full px-8">
          {pending && <span className="loading loading-spinner loading-sm" />}
          Registrar servicio
        </button>
      </div>
    </form>
  );
}
