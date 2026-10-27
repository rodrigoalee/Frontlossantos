"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { useActionState, useState } from "react";
import { FaPen } from "react-icons/fa6";
import { actualizarVehiculo } from "../actions";
import { alSalirDeLaPlaca, formatearPlaca } from "../formato";
import type { RegistrarVehiculoState, Vehiculo } from "../types";
import EliminarVehiculoBoton from "./EliminarVehiculoBoton";

const CELDA = "border-l border-base-300 px-2 py-3 font-semibold break-words text-base-content/50 first:border-l-0";

type Props = {
  vehiculo: Vehiculo;
  clienteId: number;
  puedeEditar: boolean;
  puedeEliminar: boolean;
};

type EditorProps = {
  vehiculo: Vehiculo;
  clienteId: number;
  onTerminar: () => void;
};

function EditorVehiculo({ vehiculo, clienteId, onTerminar }: EditorProps) {
  const [state, action, pending] = useActionState(
    async (prev: RegistrarVehiculoState, formData: FormData) => {
      const resultado = await actualizarVehiculo(vehiculo.idVehiculo, clienteId, prev, formData);
      if (resultado?.ok) onTerminar();
      return resultado;
    },
    undefined,
  );
  const formulario = `editar-vehiculo-${vehiculo.idVehiculo}`;
  const campos = [
    { name: "placa", etiqueta: "Placa", valor: vehiculo.placa, maxLength: 20, className: "uppercase" },
    { name: "marca", etiqueta: "Marca", valor: vehiculo.marca, maxLength: 50 },
    { name: "modelo", etiqueta: "Modelo", valor: vehiculo.modelo, maxLength: 50 },
  ];

  return (
    <tr className="bg-base-200/60 align-top">
      {campos.map((campo) => (
        <td key={campo.name} className="border-l border-base-300 px-1 py-2 first:border-l-0">
          <input
            form={formulario}
            name={campo.name}
            aria-label={campo.etiqueta}
            maxLength={campo.maxLength}
            defaultValue={state?.valores?.[campo.name] ?? campo.valor}
            onBlur={campo.name === "placa" ? alSalirDeLaPlaca : undefined}
            required
            className={`input input-sm w-full border-0 bg-base-100 text-center ${campo.className ?? ""}`}
          />
        </td>
      ))}
      <td className="border-l border-base-300 px-1 py-2">
        <input
          form={formulario}
          name="anio"
          type="number"
          inputMode="numeric"
          aria-label="Año"
          min={1900}
          max={2100}
          defaultValue={state?.valores?.anio ?? vehiculo.anio}
          required
          className="input input-sm w-full border-0 bg-base-100 text-center"
        />
      </td>
      <td className="border-l border-base-300 px-1 py-2">
        <form id={formulario} action={action} className="flex flex-col items-center gap-1">
          <button type="submit" disabled={pending} className="btn btn-primary btn-xs rounded-full px-3">
            {pending && <span className="loading loading-spinner loading-xs" />}
            Guardar
          </button>
          <button type="button" onClick={onTerminar} disabled={pending} className="btn btn-xs rounded-full px-3">
            Cancelar
          </button>
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

export default function FilaVehiculo({ vehiculo, clienteId, puedeEditar, puedeEliminar }: Props) {
  const [editando, setEditando] = useState(false);
  const placa = formatearPlaca(vehiculo.placa);

  if (editando) {
    return <EditorVehiculo vehiculo={vehiculo} clienteId={clienteId} onTerminar={() => setEditando(false)} />;
  }

  return (
    <tr className="transition-colors hover:bg-base-200/60">
      <td className={`${CELDA} tracking-wide`}>{placa}</td>
      <td className={CELDA}>{vehiculo.marca}</td>
      <td className={CELDA}>{vehiculo.modelo}</td>
      <td className={CELDA}>{vehiculo.anio}</td>
      {(puedeEditar || puedeEliminar) && (
        <td className="border-l border-base-300 px-2 py-3">
          <div className="flex items-start justify-center gap-1">
            {puedeEliminar && <EliminarVehiculoBoton idVehiculo={vehiculo.idVehiculo} placa={placa} />}
            {puedeEditar && (
              <button
                type="button"
                onClick={() => setEditando(true)}
                aria-label={`Editar vehículo ${placa}`}
                className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-secondary"
              >
                <FaPen aria-hidden className="size-3" />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
