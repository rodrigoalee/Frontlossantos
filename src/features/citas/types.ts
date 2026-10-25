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
  servicioId: number;
  fechaHora: string;
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
};
