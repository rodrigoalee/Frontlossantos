import "server-only";
import { apiFetch } from "@/lib/api";
import { todasLasPaginas } from "@/lib/paginacion";
import { ROL_CLIENTE } from "./permisos";
import type { Permiso, Rol, Sucursal, UsuarioResumen } from "./types";

export function obtenerUsuarios() {
  return todasLasPaginas<UsuarioResumen>("/api/usuarios");
}

// El rol Cliente es del portal; el mantenedor solo administra roles del personal.
export async function obtenerRolesDelPersonal() {
  const roles = await apiFetch<Rol[]>("/api/roles");
  return roles.filter((rol) => rol.nombre !== ROL_CLIENTE);
}

export function obtenerPermisos() {
  return apiFetch<Permiso[]>("/api/permisos");
}

export function obtenerPermisosDeRol(idRol: number) {
  return apiFetch<Permiso[]>(`/api/roles/${idRol}/permisos`);
}

// El resumen de cada rol se muestra al elegirlo en el asistente y al editar; son pocos roles.
export async function permisosDeCadaRol(roles: Rol[]) {
  const pares = await Promise.all(roles.map(async (rol) => [rol.idRol, await obtenerPermisosDeRol(rol.idRol)] as const));
  return Object.fromEntries(pares) as Record<number, Permiso[]>;
}

export function obtenerSedes() {
  return apiFetch<Sucursal[]>("/api/portal/sucursales");
}
