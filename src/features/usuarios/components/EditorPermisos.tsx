"use client";

import { useState, useTransition } from "react";
import { cambiarPermisoDeRol } from "../actions";
import { agruparPorModulo, etiquetaPermiso } from "../permisos";
import type { Permiso } from "../types";

type Props = {
  idRol: number;
  permisos: Permiso[];
  asignados: number[];
  editable: boolean;
};

export default function EditorPermisos({ idRol, permisos, asignados, editable }: Props) {
  const [marcados, setMarcados] = useState(() => new Set(asignados));
  const [guardando, setGuardando] = useState<number>();
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();

  function alternar(idPermiso: number, asignar: boolean) {
    setError(undefined);
    setGuardando(idPermiso);
    setMarcados((actual) => {
      const siguiente = new Set(actual);
      if (asignar) siguiente.add(idPermiso);
      else siguiente.delete(idPermiso);
      return siguiente;
    });

    startTransition(async () => {
      const resultado = await cambiarPermisoDeRol(idRol, idPermiso, asignar);
      if (resultado?.error) {
        setError(resultado.error);
        setMarcados((actual) => {
          const revertido = new Set(actual);
          if (asignar) revertido.delete(idPermiso);
          else revertido.add(idPermiso);
          return revertido;
        });
      }
      setGuardando(undefined);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {agruparPorModulo(permisos).map((grupo) => {
          const total = grupo.permisos.filter((permiso) => marcados.has(permiso.idPermiso)).length;
          return (
            <fieldset key={grupo.modulo} className="rounded-2xl border border-base-300 p-4">
              <legend className="px-1 font-semibold text-secondary">{grupo.nombre}</legend>
              <p className="-mt-1 mb-3 text-xs text-base-content/50">
                {total} de {grupo.permisos.length}
              </p>
              <ul className="flex flex-col gap-1">
                {grupo.permisos.map((permiso) => (
                  <li key={permiso.idPermiso}>
                    <label
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-2 ${editable ? "cursor-pointer hover:bg-base-200" : ""}`}
                      title={permiso.descripcion ?? permiso.nombreCodigo}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={marcados.has(permiso.idPermiso)}
                        disabled={!editable || guardando === permiso.idPermiso}
                        onChange={(e) => alternar(permiso.idPermiso, e.target.checked)}
                      />
                      <span className="text-sm">{etiquetaPermiso(permiso)}</span>
                      {guardando === permiso.idPermiso && (
                        <span className="loading loading-spinner loading-xs text-primary" aria-label="Guardando" />
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
