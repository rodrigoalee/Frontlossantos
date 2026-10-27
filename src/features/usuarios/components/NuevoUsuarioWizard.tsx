"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa6";
import Stepper from "@/components/Stepper";
import { crearUsuario } from "../actions";
import type { Permiso, Rol, Sucursal } from "../types";
import CampoPassword from "./CampoPassword";
import CamposRolSede, { CLASE_CAMPO } from "./CamposRolSede";

const PASOS = ["Datos", "Rol y sede", "Contraseña", "Confirmar"] as const;

type Props = {
  roles: Rol[];
  sedes: Sucursal[];
  permisosPorRol: Record<number, Permiso[]>;
};

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary">{children}</dd>
    </div>
  );
}

export default function NuevoUsuarioWizard({ roles, sedes, permisosPorRol }: Props) {
  const [paso, setPaso] = useState(1);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [rolId, setRolId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  const rol = roles.find((r) => String(r.idRol) === rolId);
  const sede = sedes.find((s) => String(s.idSucursal) === sucursalId);

  function siguiente(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(undefined);
    if (paso === 3 && password.length < 12) {
      setError("La contraseña debe tener al menos 12 caracteres.");
      return;
    }
    if (paso < PASOS.length) {
      setPaso(paso + 1);
      return;
    }
    startTransition(async () => {
      const resultado = await crearUsuario(
        { nombreCompleto, correo, rolId: Number(rolId), sucursalId: sucursalId ? Number(sucursalId) : null },
        password,
      );
      setError(resultado?.error);
    });
  }

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <Stepper pasos={PASOS} paso={paso} />

      <form onSubmit={siguiente} className="flex flex-col gap-6">
        {paso === 1 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nombreCompleto" className="mb-1.5 block text-sm font-semibold">
                Nombre completo
              </label>
              <input
                id="nombreCompleto"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                maxLength={150}
                required
                autoComplete="off"
                autoFocus
                className={`input ${CLASE_CAMPO}`}
              />
            </div>
            <div>
              <label htmlFor="correo" className="mb-1.5 block text-sm font-semibold">
                Correo
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                maxLength={100}
                required
                autoComplete="off"
                className={`input ${CLASE_CAMPO}`}
              />
              <p className="mt-1.5 text-xs text-base-content/60">Con este correo iniciará sesión.</p>
            </div>
          </div>
        )}

        {paso === 2 && (
          <CamposRolSede
            roles={roles}
            sedes={sedes}
            permisosPorRol={permisosPorRol}
            rolId={rolId}
            sucursalId={sucursalId}
            onRol={setRolId}
            onSede={setSucursalId}
          />
        )}

        {paso === 3 && <CampoPassword valor={password} onChange={setPassword} />}

        {paso === 4 && (
          <dl className="grid grid-cols-1 gap-5 rounded-2xl bg-base-200/60 p-5 sm:grid-cols-2">
            <Dato etiqueta="Nombre">{nombreCompleto.trim()}</Dato>
            <Dato etiqueta="Correo">{correo.trim().toLowerCase()}</Dato>
            <Dato etiqueta="Rol">{rol?.nombre}</Dato>
            <Dato etiqueta="Sede">{sede?.nombre ?? "Todas las sedes"}</Dato>
          </dl>
        )}

        {error && (
          <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          {paso === 1 ? (
            <Link href="/admin/usuarios" className="btn rounded-full px-6">
              Cancelar
            </Link>
          ) : (
            <button type="button" onClick={() => setPaso(paso - 1)} disabled={pendiente} className="btn rounded-full px-6">
              <FaArrowLeft aria-hidden className="size-3" />
              Atrás
            </button>
          )}
          <button type="submit" disabled={pendiente} className="btn btn-primary rounded-full px-8">
            {pendiente ? (
              <span className="loading loading-spinner loading-sm" />
            ) : paso === PASOS.length ? (
              <FaCheck aria-hidden className="size-3" />
            ) : null}
            {paso === PASOS.length ? "Crear usuario" : "Siguiente"}
            {paso < PASOS.length && <FaArrowRight aria-hidden className="size-3" />}
          </button>
        </div>
      </form>
    </div>
  );
}
