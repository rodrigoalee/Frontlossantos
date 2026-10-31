export type { Sucursal } from "@/features/citas/types";

export type UsuarioResumen = {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  activo: boolean;
  sucursalId: number | null;
  rolId: number | null;
  rol: string | null;
  sucursal: string | null;
};

export type Rol = {
  idRol: number;
  nombre: string;
  descripcion: string | null;
};

export type Permiso = {
  idPermiso: number;
  nombreCodigo: string;
  descripcion: string | null;
  modulo: string;
};

export type DatosUsuario = {
  nombreCompleto: string;
  correo: string;
  rolId: number;
  sucursalId: number | null;
};

export type ResultadoAccion = { error?: string } | undefined;
