"use client";

import { useState, useTransition } from "react";
import { FaMagnifyingGlass, FaUserPlus } from "react-icons/fa6";
import { formatearTelefono } from "@/features/clientes/formato";
import { registrarClienteMostrador } from "../actions";
import type { ClienteMostrador } from "../types";
import { CLASE_CAMPO, Campo, MensajeError } from "./campos";

const MAX_RESULTADOS = 8;

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function FormClienteNuevo({ onRegistrado, onCancelar }: { onRegistrado: (c: ClienteMostrador) => void; onCancelar: () => void }) {
  const [datos, setDatos] = useState({ nombreCompleto: "", telefono: "", correo: "", nit: "" });
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();
  const cambiar = (campo: keyof typeof datos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos((actual) => ({ ...actual, [campo]: e.target.value }));

  function registrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    startTransition(async () => {
      const resultado = await registrarClienteMostrador(datos);
      if (resultado.ok) onRegistrado(resultado.ok);
      else setError(resultado.error);
    });
  }

  return (
    <form onSubmit={registrar} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Campo id="cliente-nombre" etiqueta="Nombre completo">
          <input id="cliente-nombre" value={datos.nombreCompleto} onChange={cambiar("nombreCompleto")} maxLength={150} required autoFocus autoComplete="off" className={`input ${CLASE_CAMPO}`} />
        </Campo>
        <Campo id="cliente-telefono" etiqueta="Teléfono" ayuda="Con código de país, por ejemplo +50255551234.">
          <input id="cliente-telefono" type="tel" value={datos.telefono} onChange={cambiar("telefono")} maxLength={20} required autoComplete="off" className={`input ${CLASE_CAMPO}`} />
        </Campo>
        <Campo id="cliente-correo" etiqueta="Correo">
          <input id="cliente-correo" type="email" value={datos.correo} onChange={cambiar("correo")} maxLength={100} required autoComplete="off" className={`input ${CLASE_CAMPO}`} />
        </Campo>
        <Campo id="cliente-nit" etiqueta="NIT (opcional)">
          <input id="cliente-nit" value={datos.nit} onChange={cambiar("nit")} maxLength={20} autoComplete="off" className={`input ${CLASE_CAMPO}`} />
        </Campo>
      </div>
      <MensajeError error={error} />
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancelar} disabled={pendiente} className="btn rounded-full px-6">
          Volver a buscar
        </button>
        <button type="submit" disabled={pendiente} className="btn btn-primary rounded-full px-6">
          {pendiente && <span className="loading loading-spinner loading-sm" />}
          Registrar y continuar
        </button>
      </div>
    </form>
  );
}

export default function PasoCliente({ clientes, onElegir }: { clientes: ClienteMostrador[]; onElegir: (c: ClienteMostrador) => void }) {
  const [busqueda, setBusqueda] = useState("");
  const [registrando, setRegistrando] = useState(false);

  if (registrando) return <FormClienteNuevo onRegistrado={onElegir} onCancelar={() => setRegistrando(false)} />;

  const termino = normalizar(busqueda.trim());
  const digitos = busqueda.replace(/\D/g, "");
  const resultados = termino
    ? clientes
        .filter(
          (c) =>
            normalizar(c.nombreCompleto).includes(termino) ||
            normalizar(c.correo).includes(termino) ||
            (digitos.length >= 3 && c.telefono.replace(/\D/g, "").includes(digitos)),
        )
        .slice(0, MAX_RESULTADOS)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <label className="input min-h-11 w-full rounded-full border-0 bg-base-200">
        <FaMagnifyingGlass aria-hidden className="size-3.5 opacity-50" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, teléfono o correo"
          aria-label="Buscar cliente"
          autoFocus
          className="grow"
        />
      </label>

      {termino && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {resultados.length === 0 ? (
            <li className="rounded-2xl bg-base-200/60 px-4 py-3 text-sm text-base-content/70">
              No encontramos a nadie con “{busqueda.trim()}”. Regístralo como cliente nuevo.
            </li>
          ) : (
            resultados.map((cliente) => (
              <li key={cliente.idCliente}>
                <button
                  type="button"
                  onClick={() => onElegir(cliente)}
                  className="flex min-h-14 w-full flex-col items-start rounded-2xl border border-base-300 px-4 py-2 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="font-semibold break-words text-secondary">{cliente.nombreCompleto}</span>
                  <span className="text-sm break-all text-base-content/60">
                    {formatearTelefono(cliente.telefono)} · {cliente.correo}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <button type="button" onClick={() => setRegistrando(true)} className="btn min-h-11 self-start rounded-full px-5">
        <FaUserPlus aria-hidden className="size-4" />
        Registrar cliente nuevo
      </button>
    </div>
  );
}
