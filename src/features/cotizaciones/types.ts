export type EstadoCotizacion = "Pendiente" | "Aceptada" | "Rechazada";

export type LineaCotizacion = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type Cotizacion = {
  idCotizacion: number;
  estado: EstadoCotizacion;
  nota: string | null;
  total: number;
  fechaCreacion: string;
  fechaRespuesta: string | null;
  lineas: LineaCotizacion[];
};

export type NuevaLineaCotizacion = Pick<LineaCotizacion, "descripcion" | "cantidad" | "precioUnitario">;

export type ResultadoAccion = { error?: string } | undefined;

export type DestinoCotizacion = { tipo: "orden" | "cita"; id: number };
