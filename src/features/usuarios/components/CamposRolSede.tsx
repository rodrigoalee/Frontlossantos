"use client";

import { agruparPorModulo, etiquetaPermiso, PERMISO_SUCURSALES_TODAS } from "../permisos";
import type { Permiso, Rol, Sucursal } from "../types";

export const CLASE_CAMPO = "w-full border-0 bg-base-200";

export function rolVeTodasLasSedes(permisos: Permiso[] | undefined) {
  return permisos?.some((permiso) => permiso.nombreCodigo === PERMISO_SUCURSALES_TODAS) ?? false;
}

function ResumenPermisos({ permisos }: { permisos: Permiso[] }) {
  if (permisos.length === 0) {
    return <p className="text-sm text-warning">Este rol todavía no tiene permisos: la persona no podrá hacer nada.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {agruparPorModulo(permisos).map((grupo) => (
        <li key={grupo.modulo}>
          <span className="font-semibold text-secondary">{grupo.nombre}:</span>{" "}
          <span className="text-base-content/70">{grupo.permisos.map(etiquetaPermiso).join(", ")}</span>
        </li>
      ))}
    </ul>
  );
}

type Props = {
  roles: Rol[];
  sedes: Sucursal[];
  permisosPorRol: Record<number, Permiso[]>;
  rolId: string;
  sucursalId: string;
  onRol: (valor: string) => void;
  onSede: (valor: string) => void;
  rolBloqueado?: boolean;
};

export default function CamposRolSede({ roles, sedes, permisosPorRol, rolId, sucursalId, onRol, onSede, rolBloqueado }: Props) {
  const permisos = rolId ? permisosPorRol[Number(rolId)] : undefined;
  const veTodas = rolVeTodasLasSedes(permisos);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor="rol" className="mb-1.5 block text-sm font-semibold">
          Rol
        </label>
        <select
          id="rol"
          value={rolId}
          onChange={(e) => onRol(e.target.value)}
          required
          disabled={rolBloqueado}
          className={`select ${CLASE_CAMPO}`}
        >
          <option value="" disabled>
            Elige un rol
          </option>
          {roles.map((rol) => (
            <option key={rol.idRol} value={rol.idRol}>
              {rol.nombre}
            </option>
          ))}
        </select>
        {rolBloqueado && <p className="mt-1.5 text-xs text-base-content/60">No puedes cambiar tu propio rol.</p>}
        {permisos && (
          <div className="mt-3 rounded-2xl bg-base-200/60 p-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-base-content/50 uppercase">Lo que podrá hacer</p>
            <ResumenPermisos permisos={permisos} />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="sede" className="mb-1.5 block text-sm font-semibold">
          Sede {veTodas && <span className="font-normal text-base-content/60">(opcional)</span>}
        </label>
        <select
          id="sede"
          value={sucursalId}
          onChange={(e) => onSede(e.target.value)}
          required={!veTodas}
          className={`select ${CLASE_CAMPO}`}
        >
          <option value="" disabled={!veTodas}>
            {veTodas ? "Todas las sedes" : "Elige una sede"}
          </option>
          {sedes.map((sede) => (
            <option key={sede.idSucursal} value={sede.idSucursal}>
              {sede.nombre}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-base-content/60">
          {veTodas ? "Este rol trabaja en todas las sedes." : "Solo verá y atenderá lo de esta sede."}
        </p>
      </div>
    </div>
  );
}
