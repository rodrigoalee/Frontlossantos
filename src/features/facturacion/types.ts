export type EstadoPago = "Pendiente" | "Pagado";

export type FacturaLista = {
  idFacturaEncabezado: number;
  sucursalId: number;
  ordenTrabajoId: number;
  fechaEmision: string;
  nombreFacturacion: string;
  nitFacturacion: string | null;
  totalPagado: number;
  estadoPago: EstadoPago;
  placa: string;
  pagoConTarjeta: boolean;
};

export type FacturaDetalle = {
  idFacturaEncabezado: number;
  sucursalId: number;
  ordenTrabajoId: number;
  fechaEmision: string;
  clienteId: number;
  nombreFacturacion: string;
  nitFacturacion: string | null;
  placa: string;
  subtotal: number;
  tasaImpuesto: number;
  montoImpuesto: number;
  totalPagado: number;
  estadoPago: EstadoPago;
  stripePaymentId: string | null;
  usuarioCajero: string;
  lineas: { idFacturaDetalle: number; descripcionItem: string; cantidad: number; precioUnitario: number; subtotal: number }[];
};

export type FacturaPortal = {
  idFactura: number;
  fechaEmision: string;
  placa: string;
  total: number;
  pagada: boolean;
};

/** Sin pago no hay forma; pagada sin id de Stripe significa que se cobró en caja. */
export function formaDePago(estado: EstadoPago, conTarjeta: boolean) {
  if (estado !== "Pagado") return "—";
  return conTarjeta ? "Tarjeta (Stripe)" : "Efectivo";
}
