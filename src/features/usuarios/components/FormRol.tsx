"use client";

import AvisoAccion from "@/components/AvisoAccion";
import Link from "next/link";
import { useState, useTransition } from "react";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
import { eliminarRol, guardarRol } from "../actions";
import type { Rol } from "../types";
import { CLASE_CAMPO } from "./CamposRolSede";

export function FormRol({ rol, rutaCancelar }: { rol?: Rol; rutaCancelar: string }) {
  const [nombre, setNombre] = useState(rol?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? "");
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    startTransition(async () => {
      const resultado = await guardarRol(rol?.idRol ?? null, nombre, descripcion);
      setError(resultado?.error);
    });
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      <div>
        <label htmlFor="rol-nombre" className="mb-1.5 block text-sm font-semibold">
          Nombre del rol
        </label>
        <input
          id="rol-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={50}
          required
          autoFocus
          className={`input ${CLASE_CAMPO}`}
        />
      </div>
      <div>
        <label htmlFor="rol-descripcion" className="mb-1.5 block text-sm font-semibold">
          Descripción <span className="font-normal text-base-content/60">(opcional)</span>
        </label>
        <input
          id="rol-descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={200}
          className={`input ${CLASE_CAMPO}`}
        />
      </div>
      {error && (
        <AvisoAccion>
          {error}
        </AvisoAccion>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Link href={rutaCancelar} className="btn rounded-full px-6">
          Cancelar
        </Link>
        <button type="submit" disabled={pendiente} className="btn btn-primary rounded-full px-8">
          {pendiente && <span className="loading loading-spinner loading-sm" />}
          {rol ? "Guardar" : "Crear rol"}
        </button>
      </div>
    </form>
  );
}

export function EliminarRolBoton({ rol, usuariosConRol }: { rol: Rol; usuariosConRol: number }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();

  if (usuariosConRol > 0) {
    return (
      <p className="text-xs text-base-content/60">
        Para eliminarlo, primero cambia de rol a {usuariosConRol === 1 ? "la persona que lo tiene" : `las ${usuariosConRol} personas que lo tienen`}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {confirmando && (
        <ConfirmacionAccion
          titulo={`¿Eliminar el rol ${rol.nombre}?`}
          textoConfirmar="Sí, eliminar"
          textoCancelar="Volver"
          pendiente={pendiente}
          onConfirmar={() =>
            startTransition(async () => {
              const resultado = await eliminarRol(rol.idRol);
              setError(resultado?.error);
              setConfirmando(false);
            })
          }
          onCancelar={() => setConfirmando(false)}
        />
      )}
      <button type="button" onClick={() => setConfirmando(true)} className="btn btn-ghost btn-sm self-start rounded-full text-error">
        Eliminar rol
      </button>
      {error && (
        <AvisoAccion>
          {error}
        </AvisoAccion>
      )}
    </div>
  );
}
