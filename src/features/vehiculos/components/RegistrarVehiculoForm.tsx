"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { RecorridoPrimeraVez } from "@/components/Recorrido";
import Link from "next/link";
import { useActionState } from "react";
import { registrarVehiculo } from "../actions";
import { AYUDA_PLACA, PATRON_PLACA, alSalirDeLaPlaca } from "../formato";
import type { RegistrarVehiculoState } from "../types";

const CAMPOS = [
  { name: "placa", label: "Placa", maxLength: 20, className: "uppercase" },
  { name: "marca", label: "Marca", maxLength: 50 },
  { name: "modelo", label: "Modelo", maxLength: 50 },
] as const;

type Props = {
  accion?: (prev: RegistrarVehiculoState, formData: FormData) => Promise<RegistrarVehiculoState>;
  /** En el perfil del cliente: al registrar ofrece agendar la cita, que es lo que sigue. */
  conSiguientePaso?: boolean;
};

export default function RegistrarVehiculoForm({ accion = registrarVehiculo, conSiguientePaso = false }: Props) {
  const [state, action, pending] = useActionState(accion, undefined);
  const valores = state?.valores;

  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="font-semibold text-secondary">Registrar vehículo</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CAMPOS.map((campo) => (
          <div key={campo.name}>
            <label htmlFor={campo.name} className="mb-1.5 block text-sm font-semibold">
              {campo.label}
            </label>
            <input
              id={campo.name}
              name={campo.name}
              maxLength={campo.maxLength}
              defaultValue={valores?.[campo.name]}
              onBlur={campo.name === "placa" ? alSalirDeLaPlaca : undefined}
              pattern={campo.name === "placa" ? PATRON_PLACA : undefined}
              title={campo.name === "placa" ? AYUDA_PLACA : undefined}
              required
              className={`input w-full border-0 bg-base-200 ${"className" in campo ? campo.className : ""}`}
            />
          </div>
        ))}
        <div>
          <label htmlFor="anio" className="mb-1.5 block text-sm font-semibold">
            Año
          </label>
          <input
            id="anio"
            name="anio"
            type="number"
            inputMode="numeric"
            min={1900}
            max={2100}
            defaultValue={valores?.anio}
            required
            className="input w-full border-0 bg-base-200"
          />
        </div>
      </div>

      {state?.error && (
        <AvisoAccion origen={state}>
          {state.error}
        </AvisoAccion>
      )}
      {state?.ok && (
        <AvisoAccion exito origen={state}>
          Vehículo registrado.
        </AvisoAccion>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary rounded-full px-6">
          {pending && <span className="loading loading-spinner loading-sm" />}
          Registrar vehículo
        </button>
        {conSiguientePaso && state?.ok && (
          <>
            <Link
              href="/panel/citas/nueva"
              data-recorrido="agendar-tras-vehiculo"
              className="btn btn-outline btn-primary rounded-full px-6"
            >
              Agendar cita
            </Link>
            <RecorridoPrimeraVez nombre="vehiculo" />
          </>
        )}
      </div>
    </form>
  );
}
