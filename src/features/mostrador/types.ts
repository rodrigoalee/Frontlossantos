import type { ClienteResumen, VehiculoDeCliente } from "@/features/clientes/types";

export type Resultado<T> = { ok: T; error?: undefined } | { ok?: undefined; error: string };

export type ClienteMostrador = Pick<ClienteResumen, "idCliente" | "nombreCompleto" | "telefono" | "correo">;

export type VehiculoMostrador = VehiculoDeCliente;

export type DatosClienteNuevo = { nombreCompleto: string; telefono: string; correo: string; nit: string };

export type DatosVehiculoNuevo = { placa: string; marca: string; modelo: string; anio: string };

export type DatosCitaMostrador = {
  vehiculoId: number;
  servicioId: number | null;
  sucursalId: number | null;
  /** ISO en UTC; el navegador lo convierte desde su hora local, que es la del taller. */
  fechaHora: string;
  motivo: string;
};
