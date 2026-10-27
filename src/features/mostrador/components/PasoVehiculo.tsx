"use client";

import { useState, useTransition } from "react";
import { FaCar, FaPlus } from "react-icons/fa6";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { registrarVehiculoMostrador } from "../actions";
import type { VehiculoMostrador } from "../types";
import { CLASE_CAMPO, Campo, MensajeError } from "./campos";

function FormVehiculoNuevo({
  idCliente,
  onRegistrado,
  onCancelar,
}: {
  idCliente: number;
  onRegistrado: (v: VehiculoMostrador) => void;
  onCancelar?: () => void;
}) {
  const [datos, setDatos] = useState({ placa: "", marca: "", modelo: "", anio: "" });
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();
  const cambiar = (campo: keyof typeof datos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos((actual) => ({ ...actual, [campo]: e.target.value }));

  function registrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    startTransition(async () => {
      const resultado = await registrarVehiculoMostrador(idCliente, datos);
      if (resultado.ok) onRegistrado(resultado.ok);
      else setError(resultado.error);
    });
  }

  return (
    <form onSubmit={registrar} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Campo id="vehiculo-placa" etiqueta="Placa">
          <input id="vehiculo-placa" value={datos.placa} onChange={cambiar("placa")} maxLength={20} required autoFocus className={`input uppercase ${CLASE_CAMPO}`} />
        </Campo>
        <Campo id="vehiculo-anio" etiqueta="Año">
          <input id="vehiculo-anio" type="number" inputMode="numeric" min={1900} max={2100} value={datos.anio} onChange={cambiar("anio")} required className={`input ${CLASE_CAMPO}`} />
        </Campo>
        <Campo id="vehiculo-marca" etiqueta="Marca">
          <input id="vehiculo-marca" value={datos.marca} onChange={cambiar("marca")} maxLength={50} required className={`input ${CLASE_CAMPO}`} />
        </Campo>
        <Campo id="vehiculo-modelo" etiqueta="Modelo">
          <input id="vehiculo-modelo" value={datos.modelo} onChange={cambiar("modelo")} maxLength={50} required className={`input ${CLASE_CAMPO}`} />
        </Campo>
      </div>
      <MensajeError error={error} />
      <div className="flex flex-wrap justify-end gap-3">
        {onCancelar && (
          <button type="button" onClick={onCancelar} disabled={pendiente} className="btn rounded-full px-6">
            Elegir uno registrado
          </button>
        )}
        <button type="submit" disabled={pendiente} className="btn btn-primary rounded-full px-6">
          {pendiente && <span className="loading loading-spinner loading-sm" />}
          Registrar y continuar
        </button>
      </div>
    </form>
  );
}

export default function PasoVehiculo({
  idCliente,
  vehiculos,
  onElegir,
}: {
  idCliente: number;
  vehiculos: VehiculoMostrador[];
  onElegir: (v: VehiculoMostrador) => void;
}) {
  const [registrando, setRegistrando] = useState(vehiculos.length === 0);

  if (registrando) {
    return (
      <div className="flex flex-col gap-4">
        {vehiculos.length === 0 && <p className="text-sm text-base-content/70">El cliente aún no tiene vehículos. Registra el que trae.</p>}
        <FormVehiculoNuevo
          idCliente={idCliente}
          onRegistrado={onElegir}
          onCancelar={vehiculos.length > 0 ? () => setRegistrando(false) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {vehiculos.map((vehiculo) => (
          <li key={vehiculo.idVehiculo}>
            <button
              type="button"
              onClick={() => onElegir(vehiculo)}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-base-300 px-4 py-2 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <FaCar aria-hidden className="size-4 shrink-0 text-secondary" />
              <span className="min-w-0">
                <span className="block font-semibold text-secondary">{formatearPlaca(vehiculo.placa)}</span>
                <span className="block text-sm text-base-content/60">
                  {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setRegistrando(true)} className="btn min-h-11 self-start rounded-full px-5">
        <FaPlus aria-hidden className="size-3" />
        Registrar otro vehículo
      </button>
    </div>
  );
}
