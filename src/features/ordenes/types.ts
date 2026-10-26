import type { EstadoOrden } from "@/features/citas/types";

export type { EstadoOrden };

export type OrdenLista = {
  idOrdenEncabezado: number;
  sucursalId: number;
  vehiculoId: number;
  placa: string;
  nombreCliente: string;
  fechaIngreso: string;
  fechaFinalizacion: string | null;
  estado: EstadoOrden;
  totalEstimado: number;
  mecanicoAsignado: string | null;
  servicio: string | null;
};

export type ConteoOrdenesPorEstado = {
  enRecepcion: number;
  enProceso: number;
  finalizado: number;
};

export type LineaOrden = {
  idOrdenDetalle: number;
  tipoLinea: "Repuesto" | "Servicio" | "Adicional";
  repuestoId: number | null;
  servicioId: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotalEstimado: number;
};

export type OrdenDetalle = {
  idOrdenEncabezado: number;
  sucursalId: number;
  vehiculoId: number;
  placa: string;
  marca: string;
  modelo: string;
  clienteId: number;
  nombreCliente: string;
  fechaIngreso: string;
  fechaFinalizacion: string | null;
  diagnostico: string | null;
  estado: EstadoOrden;
  totalEstimado: number;
  usuarioRecepcion: string;
  mecanicoAsignado: string | null;
  lineas: LineaOrden[];
  citaId: number | null;
  motivoIngreso: string | null;
  mecanicoAsignadoId: number | null;
};

export type MecanicoDisponible = {
  idUsuario: number;
  nombreCompleto: string;
  ordenesActivas: number;
};

export type RepuestoInventario = {
  repuestoId: number;
  codigoStock: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
};

export type ServicioCatalogo = {
  idServicio: number;
  nombre: string;
  tarifaManoObra: number;
  activo: boolean;
};

export type NuevaOrden = {
  citaId: number;
  mecanicoAsignadoId: number | null;
  motivoIngreso: string | null;
};

export type NuevaLinea = {
  repuestoId: number | null;
  servicioId: number | null;
  cantidad: number;
};

export type ResultadoAccion = { error?: string } | undefined;
