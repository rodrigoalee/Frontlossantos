"use client";

import AvisoAccion from "@/components/AvisoAccion";
import Link from "next/link";
import { useActionState } from "react";
import { crearRepuesto } from "../actions";
import CamposRepuesto from "./CamposRepuesto";

export default function NuevoRepuestoForm() {
  const [state, action, pending] = useActionState(crearRepuesto, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CamposRepuesto valores={state?.valores} />
      </div>

      {state?.error && (
        <AvisoAccion origen={state}>
          {state.error}
        </AvisoAccion>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/admin/repuestos" className="btn rounded-full px-6">
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className="btn btn-primary rounded-full px-8">
          {pending && <span className="loading loading-spinner loading-sm" />}
          Registrar repuesto
        </button>
      </div>
    </form>
  );
}
