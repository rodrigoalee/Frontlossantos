import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { verificarEmpleado } from "@/features/auth/dal";
import { formatearFechaCita, formatearMoneda } from "@/features/citas/formato";
import AccionesCobro from "@/features/pagos/components/AccionesCobro";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { ApiError } from "@/lib/api";
import { obtenerFactura } from "../dal";
import { type FacturaDetalle, formaDePago } from "../types";

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary">{children}</dd>
    </div>
  );
}

export default async function DetalleFactura({ idFactura }: { idFactura: number }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);

  let factura: FacturaDetalle;
  try {
    factura = await obtenerFactura(idFactura);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const pagada = factura.estadoPago === "Pagado";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <section className="flex flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-secondary">Factura #{factura.idFacturaEncabezado}</h2>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              pagada ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {pagada ? "Pagada" : "Pendiente de pago"}
          </span>
        </div>

        <ul className="flex flex-col divide-y divide-base-200">
          {factura.lineas.map((linea) => (
            <li key={linea.idFacturaDetalle} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium break-words">{linea.descripcionItem}</p>
                <p className="text-sm text-base-content/60">
                  {linea.cantidad} × {formatearMoneda(linea.precioUnitario)}
                </p>
              </div>
              <span className="shrink-0 font-semibold">{formatearMoneda(linea.subtotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="ml-auto grid w-full max-w-xs grid-cols-2 gap-y-1 text-sm">
          <dt className="text-base-content/60">Subtotal</dt>
          <dd className="text-right">{formatearMoneda(factura.subtotal)}</dd>
          <dt className="text-base-content/60">IVA ({Math.round(factura.tasaImpuesto * 100)} %)</dt>
          <dd className="text-right">{formatearMoneda(factura.montoImpuesto)}</dd>
          <dt className="text-lg font-bold text-secondary">Total</dt>
          <dd className="text-right text-lg font-bold text-secondary">{formatearMoneda(factura.totalPagado)}</dd>
        </dl>
      </section>

      <aside className="flex flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-secondary">Datos</h2>
          <dl className="flex flex-col gap-4">
            <Dato etiqueta="Emitida">{formatearFechaCita(factura.fechaEmision)}</Dato>
            <Dato etiqueta="Facturado a">{factura.nombreFacturacion}</Dato>
            <Dato etiqueta="NIT">{factura.nitFacturacion ?? "CF"}</Dato>
            <Dato etiqueta="Vehículo">{formatearPlaca(factura.placa)}</Dato>
            <Dato etiqueta="Cajero">{factura.usuarioCajero}</Dato>
            <Dato etiqueta="Forma de pago">{formaDePago(factura.estadoPago, factura.stripePaymentId !== null)}</Dato>
            {factura.stripePaymentId && <Dato etiqueta="Pago en Stripe">{factura.stripePaymentId}</Dato>}
          </dl>
          {permisos.has("ordenes.leer") && (
            <Link href={`/admin/ordenes/${factura.ordenTrabajoId}`} className="btn btn-sm self-start rounded-full">
              Ver la orden #{factura.ordenTrabajoId}
            </Link>
          )}
        </section>

        {!pagada && (
          <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-secondary">Cobrar</h2>
            <AccionesCobro
              idOrden={factura.ordenTrabajoId}
              idFactura={factura.idFacturaEncabezado}
              puedeFacturar={permisos.has("facturas.crear")}
              puedeRegistrarEfectivo={permisos.has("facturas.registrar_pago_manual")}
            />
          </section>
        )}
      </aside>
    </div>
  );
}
