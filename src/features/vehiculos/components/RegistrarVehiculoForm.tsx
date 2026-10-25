"use client";

import { useActionState } from "react";
import { registrarVehiculo } from "../actions";

const CAMPOS = [
  { name: "placa", label: "Placa", maxLength: 20, className: "uppercase" },
  { name: "marca", label: "Marca", maxLength: 50 },
  { name: "modelo", label: "Modelo", maxLength: 50 },
] as const;

export default function RegistrarVehiculoForm() {
  const [state, action, pending] = useActionState(registrarVehiculo, undefined);
  const valores = state?.valores;

  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="font-semibold text-secondary">Registrar vehículo</p>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-sm text-emerald-700">
          Vehículo registrado.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary self-start rounded-full px-6">
        {pending && <span className="loading loading-spinner loading-sm" />}
        Registrar vehículo
      </button>
    </form>
  );
}
