export type ClienteResumen = {
  idCliente: number;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  cantidadVehiculos: number;
};

export type ClienteConPlacas = ClienteResumen & {
  placas: string[];
};

export type VehiculoDeCliente = {
  idVehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
};

export type ClienteDetalle = {
  idCliente: number;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  nit: string | null;
  vehiculos: VehiculoDeCliente[];
};

export type ResultadoPaginado<T> = {
  items: T[];
  pagina: number;
  tamanio: number;
  total: number;
};

export type EditarClienteState = {
  error?: string;
  ok?: boolean;
} | undefined;

export type NuevoClienteState = {
  error?: string;
  valores?: Record<string, string>;
} | undefined;
