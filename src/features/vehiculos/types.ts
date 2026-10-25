export type Vehiculo = {
  idVehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
};

export type RegistrarVehiculoState = {
  error?: string;
  ok?: boolean;
  valores?: Record<string, string>;
} | undefined;
