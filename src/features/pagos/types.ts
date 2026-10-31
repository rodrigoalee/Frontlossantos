export type ResumenPago = {
  idFactura: number;
  nombreCliente: string;
  vehiculo: string;
  sucursal: string;
  lineas: { descripcion: string; cantidad: number; subtotal: number }[];
  subtotal: number;
  montoImpuesto: number;
  total: number;
  pagada: boolean;
};

export type DatosTarjeta = {
  numeroTarjeta: string;
  vencimiento: string;
  cvc: string;
  titular: string;
};

export type ResultadoPago = { pagado: boolean; mensaje: string };

export type FacturaDeOrden = {
  idFacturaEncabezado: number;
  totalPagado: number;
  estadoPago: "Pendiente" | "Pagado";
};

export type ResultadoAccion = { error?: string; ok?: string } | undefined;
