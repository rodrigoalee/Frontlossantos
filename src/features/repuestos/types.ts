export type Repuesto = {
  idRepuesto: number;
  codigoStock: string;
  nombre: string;
  precioUnitario: number;
  activo: boolean;
};

export type ExistenciaSede = {
  idSucursal: number;
  sede: string;
  cantidad: number;
};

export type RepuestoState = {
  error?: string;
  ok?: boolean;
  valores?: Record<string, string>;
} | undefined;

export type AccionRepuestoState = {
  error?: string;
} | undefined;
