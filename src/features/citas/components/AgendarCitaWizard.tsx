"use client";

import { useState, useTransition } from "react";
import { formatearPlaca } from "@/features/vehiculos/formato";
import type { Vehiculo } from "@/features/vehiculos/types";
import { agendarCita } from "../actions";
import { formatearFechaCita, formatearMoneda } from "../formato";
import type { Servicio, Sucursal } from "../types";
import SelectorFechaHora from "./SelectorFechaHora";
import Stepper from "./Stepper";

type Props = {
  vehiculos: Vehiculo[];
  sucursales: Sucursal[];
  servicios: Servicio[];
};

const CLASE_SELECT = "select w-full border-0 bg-base-200";

function describirVehiculo(vehiculo: Vehiculo) {
  return `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio} · ${formatearPlaca(vehiculo.placa)}`;
}

export default function AgendarCitaWizard({ vehiculos, sucursales, servicios }: Props) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [vehiculoId, setVehiculoId] = useState(vehiculos.length === 1 ? String(vehiculos[0].idVehiculo) : "");
  const [sucursalId, setSucursalId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [fechaHora, setFechaHora] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [pendiente, startTransition] = useTransition();

  const vehiculo = vehiculos.find((v) => String(v.idVehiculo) === vehiculoId);
  const sucursal = sucursales.find((s) => String(s.idSucursal) === sucursalId);
  const servicio = servicios.find((s) => String(s.idServicio) === servicioId);
  const completo = vehiculo && sucursal && servicio && fechaHora;

  function confirmar() {
    if (!completo) return;
    startTransition(async () => {
      const resultado = await agendarCita({
        vehiculoId: vehiculo.idVehiculo,
        sucursalId: sucursal.idSucursal,
        servicioId: servicio.idServicio,
        fechaHora,
      });
      if (resultado?.error) {
        setError(resultado.error);
        setFechaHora(null);
        setVersion((n) => n + 1);
        setPaso(1);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <Stepper paso={paso} />

      {error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {paso === 1 ? (
        <form
          className="flex flex-col gap-6"
          onSubmit={(evento) => {
            evento.preventDefault();
            if (completo) {
              setError(null);
              setPaso(2);
            }
          }}
        >
          <div>
            <label htmlFor="vehiculo" className="mb-1.5 block text-sm font-semibold">
              Vehículo
            </label>
            <select
              id="vehiculo"
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              required
              className={CLASE_SELECT}
            >
              <option value="" disabled>
                Elige un vehículo
              </option>
              {vehiculos.map((v) => (
                <option key={v.idVehiculo} value={v.idVehiculo}>
                  {describirVehiculo(v)}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-base-content/60">Solo aparecen los vehículos registrados a tu nombre.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="sede" className="mb-1.5 block text-sm font-semibold">
                Sede
              </label>
              <select
                id="sede"
                value={sucursalId}
                onChange={(e) => {
                  setSucursalId(e.target.value);
                  setFechaHora(null);
                }}
                required
                className={CLASE_SELECT}
              >
                <option value="" disabled>
                  Elige una sede
                </option>
                {sucursales.map((s) => (
                  <option key={s.idSucursal} value={s.idSucursal}>
                    {s.nombre} — {s.direccion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="servicio" className="mb-1.5 block text-sm font-semibold">
                Servicio
              </label>
              <select
                id="servicio"
                value={servicioId}
                onChange={(e) => setServicioId(e.target.value)}
                required
                className={CLASE_SELECT}
              >
                <option value="" disabled>
                  Elige un servicio
                </option>
                {servicios.map((s) => (
                  <option key={s.idServicio} value={s.idServicio}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-base-content/60">El precio es estimado; puede variar tras el diagnóstico.</p>
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">Fecha y hora</legend>
            {sucursal ? (
              <SelectorFechaHora
                key={`${sucursal.idSucursal}-${version}`}
                sucursalId={sucursal.idSucursal}
                valor={fechaHora}
                onCambio={setFechaHora}
              />
            ) : (
              <p className="rounded-2xl bg-base-200 px-4 py-6 text-center text-sm text-base-content/60">
                Elige una sede para ver los horarios disponibles.
              </p>
            )}
            <p className="mt-2 text-xs text-base-content/60">Lunes a viernes de 8:00 a 18:00, sábados de 8:00 a 13:00.</p>
          </fieldset>

          <button type="submit" disabled={!completo} className="btn btn-primary self-end rounded-full px-8">
            Continuar
          </button>
        </form>
      ) : (
        completo && (
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <section
              aria-labelledby="titulo-resumen"
              className="flex flex-col gap-5 rounded-3xl border border-base-300 p-5 sm:p-8"
            >
              <h2 id="titulo-resumen" className="text-2xl font-bold text-secondary">
                Resumen de cita
              </h2>
              <dl className="flex flex-col gap-4">
                <Dato etiqueta="Vehículo" valor={describirVehiculo(vehiculo)} />
                <Dato etiqueta="Sede" valor={`${sucursal.nombre} — ${sucursal.direccion}`} />
                <Dato etiqueta="Servicio" valor={servicio.nombre} />
                <Dato etiqueta="Fecha y hora" valor={formatearFechaCita(fechaHora)} />
                <div className="border-t border-base-300 pt-4">
                  <dt className="font-semibold text-base-content/50">Precio</dt>
                  <dd className="text-2xl font-bold text-secondary">{formatearMoneda(servicio.tarifaManoObra)}</dd>
                  <dd className="mt-1 text-xs text-base-content/60">
                    Mano de obra estimada; puede variar tras el diagnóstico.
                  </dd>
                </div>
              </dl>
            </section>
            <p className="text-center text-sm text-base-content/60">El taller confirmará tu cita antes de la visita.</p>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setPaso(1)} disabled={pendiente} className="btn rounded-full px-6">
                Volver
              </button>
              <button type="button" onClick={confirmar} disabled={pendiente} className="btn btn-primary rounded-full px-8">
                {pendiente && <span className="loading loading-spinner loading-sm" />}
                Confirmar cita
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary sm:text-lg">{valor}</dd>
    </div>
  );
}
