"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa6";
import Stepper from "@/components/Stepper";
import { formatearFechaCita } from "@/features/citas/formato";
import type { Servicio, Sucursal } from "@/features/citas/types";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { crearCitaMostrador, vehiculosDeCliente } from "../actions";
import type { ClienteMostrador, VehiculoMostrador } from "../types";
import { CLASE_CAMPO, Campo, MensajeError } from "./campos";
import PasoCliente from "./PasoCliente";
import PasoVehiculo from "./PasoVehiculo";

const PASOS = ["Cliente", "Vehículo", "Cita", "Confirmar"] as const;

/** "Ahora" en la hora local del navegador, con el formato de <input type="datetime-local">. */
function ahoraLocal() {
  const ahora = new Date();
  ahora.setSeconds(0, 0);
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary">{children}</dd>
    </div>
  );
}

type Props = {
  clientes: ClienteMostrador[];
  servicios: Servicio[];
  sedes: Sucursal[];
};

export default function NuevaCitaTallerWizard({ clientes, servicios, sedes }: Props) {
  const [paso, setPaso] = useState(1);
  const [cliente, setCliente] = useState<ClienteMostrador>();
  const [vehiculos, setVehiculos] = useState<VehiculoMostrador[]>([]);
  const [vehiculo, setVehiculo] = useState<VehiculoMostrador>();
  const [servicioId, setServicioId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  const servicio = servicios.find((s) => String(s.idServicio) === servicioId);
  const sede = sedes.find((s) => String(s.idSucursal) === sucursalId);

  function elegirCliente(elegido: ClienteMostrador) {
    setError(undefined);
    startTransition(async () => {
      const resultado = await vehiculosDeCliente(elegido.idCliente);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setCliente(elegido);
      setVehiculos(resultado.ok);
      setVehiculo(undefined);
      setPaso(2);
    });
  }

  function elegirVehiculo(elegido: VehiculoMostrador) {
    setVehiculo(elegido);
    setFechaHora((actual) => actual || ahoraLocal());
    setPaso(3);
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(undefined);
    if (paso === 3) {
      setPaso(4);
      return;
    }
    startTransition(async () => {
      const resultado = await crearCitaMostrador({
        vehiculoId: vehiculo!.idVehiculo,
        servicioId: Number(servicioId),
        sucursalId: sucursalId ? Number(sucursalId) : null,
        fechaHora: new Date(fechaHora).toISOString(),
        motivo,
      });
      setError(resultado.error);
    });
  }

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <Stepper pasos={PASOS} paso={paso} />

      {paso > 1 && cliente && (
        <p className="-mt-2 rounded-2xl bg-base-200/60 px-4 py-3 text-sm">
          <span className="font-semibold text-secondary">{cliente.nombreCompleto}</span>
          {vehiculo && paso > 2 && ` · ${formatearPlaca(vehiculo.placa)} ${vehiculo.marca} ${vehiculo.modelo}`}
        </p>
      )}

      {paso === 1 && (pendiente ? <div className="skeleton h-32 w-full rounded-2xl" aria-busy="true" /> : <PasoCliente clientes={clientes} onElegir={elegirCliente} />)}

      {paso === 2 && cliente && <PasoVehiculo idCliente={cliente.idCliente} vehiculos={vehiculos} onElegir={elegirVehiculo} />}

      {paso >= 3 && (
        <form onSubmit={enviar} className="flex flex-col gap-6">
          {paso === 3 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Campo id="cita-servicio" etiqueta="Servicio">
                <select id="cita-servicio" value={servicioId} onChange={(e) => setServicioId(e.target.value)} required className={`select ${CLASE_CAMPO}`}>
                  <option value="" disabled>
                    Elige un servicio
                  </option>
                  {servicios.map((s) => (
                    <option key={s.idServicio} value={s.idServicio}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
              {sedes.length > 0 && (
                <Campo id="cita-sede" etiqueta="Sede">
                  <select id="cita-sede" value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} required className={`select ${CLASE_CAMPO}`}>
                    <option value="" disabled>
                      Elige una sede
                    </option>
                    {sedes.map((s) => (
                      <option key={s.idSucursal} value={s.idSucursal}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>
              )}
              <Campo id="cita-fecha" etiqueta="Fecha y hora" ayuda="Ya viene con la hora actual porque el cliente está en el taller.">
                <input id="cita-fecha" type="datetime-local" value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} required className={`input ${CLASE_CAMPO}`} />
              </Campo>
              <div className="sm:col-span-2">
                <Campo id="cita-motivo" etiqueta="Lo que reporta el cliente (opcional)">
                  <textarea
                    id="cita-motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Ej. Hace un ruido al frenar"
                    className={`textarea ${CLASE_CAMPO}`}
                  />
                </Campo>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-5 rounded-2xl bg-base-200/60 p-5 sm:grid-cols-2">
              <Dato etiqueta="Cliente">{cliente?.nombreCompleto}</Dato>
              <Dato etiqueta="Vehículo">
                {vehiculo && `${formatearPlaca(vehiculo.placa)} · ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}`}
              </Dato>
              <Dato etiqueta="Servicio">{servicio?.nombre}</Dato>
              <Dato etiqueta="Fecha y hora">{fechaHora && formatearFechaCita(new Date(fechaHora).toISOString())}</Dato>
              {sede && <Dato etiqueta="Sede">{sede.nombre}</Dato>}
              {motivo.trim() && <Dato etiqueta="Lo que reporta">{motivo.trim()}</Dato>}
            </dl>
          )}

          <MensajeError error={error} />

          <div className="flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => setPaso(paso - 1)} disabled={pendiente} className="btn rounded-full px-6">
              <FaArrowLeft aria-hidden className="size-3" />
              Atrás
            </button>
            <button type="submit" disabled={pendiente} className="btn btn-primary rounded-full px-8">
              {pendiente ? <span className="loading loading-spinner loading-sm" /> : paso === 4 && <FaCheck aria-hidden className="size-3" />}
              {paso === 4 ? "Crear cita" : "Siguiente"}
              {paso === 3 && <FaArrowRight aria-hidden className="size-3" />}
            </button>
          </div>
        </form>
      )}

      {paso < 3 && (
        <>
          <MensajeError error={error} />
          <div className="flex flex-wrap justify-between gap-3">
            {paso === 1 ? (
              <Link href="/admin/citas" className="btn rounded-full px-6">
                Cancelar
              </Link>
            ) : (
              <button type="button" onClick={() => setPaso(1)} className="btn rounded-full px-6">
                <FaArrowLeft aria-hidden className="size-3" />
                Cambiar cliente
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
