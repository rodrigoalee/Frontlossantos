import type { FotoOrden } from "@/features/ordenes/types";

export type EstadoCita = "Pendiente" | "Confirmada" | "Cancelada";

export type EstadoOrden = "EnRecepcion" | "EnProceso" | "Finalizado";

export type CitaPortal = {
  idCita: number;
  servicio: string | null;
  motivo: string | null;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  fechaHora: string;
  estado: EstadoCita;
};

export type Sucursal = {
  idSucursal: number;
  nombre: string;
  direccion: string;
};

export type Servicio = {
  idServicio: number;
  nombre: string;
  tarifaManoObra: number;
};

export type HorarioDisponible = {
  fechaHora: string;
  disponible: boolean;
  lleno: boolean;
};

export type DiaDisponibilidad = {
  fecha: string;
  horarios: HorarioDisponible[];
};

export type NuevaCita = {
  vehiculoId: number;
  sucursalId: number;
  servicioId: number | null;
  fechaHora: string;
  descripcionServicio?: string;
};

export type SeguimientoCita = {
  idCita: number;
  servicio: string | null;
  motivo: string | null;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  sucursal: string;
  fechaHora: string;
  estado: EstadoCita;
  estadoOrden: EstadoOrden | null;
  fechaIngreso: string | null;
  fechaFinalizacion: string | null;
  pagado: boolean;
  diagnostico: string | null;
  fotos: FotoOrden[];
};

export type CitaTaller = {
  idCita: number;
  sucursalId: number;
  vehiculoId: number;
  placa: string;
  nombreCliente: string;
  fechaHora: string;
  duracionMinutos: number;
  estado: EstadoCita;
  servicio: string | null;
  idOrden: number | null;
};

export type CitaTallerDetalle = CitaTaller & {
  marca: string;
  modelo: string;
  clienteId: number;
  telefonoCliente: string;
  motivo: string | null;
  servicioPersonalizado: boolean;
};

export type CambiarEstadoCitaState = {
  error?: string;
} | undefined;
