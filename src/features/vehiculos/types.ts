export type Vehiculo = {
  idVehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
};

export type VehiculoLista = Vehiculo & {
  clienteId: number;
  nombreCliente: string;
};

export type RegistrarVehiculoState = {
  error?: string;
  ok?: boolean;
  valores?: Record<string, string>;
} | undefined;

export type EliminarVehiculoState = {
  error?: string;
} | undefined;
