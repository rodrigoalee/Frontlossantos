import { formatearMoneda } from "@/features/citas/formato";
import { obtenerFacturaDeOrden } from "../dal";
import AccionesCobro from "./AccionesCobro";

type Props = {
  idOrden: number;
  totalEstimado: number;
  permisos: Set<string>;
};

/** Al recoger el vehículo: factura, enlace de pago por WhatsApp o pago en caja. */
export default async function CobroOrden({ idOrden, totalEstimado, permisos }: Props) {
  if (!permisos.has("facturas.leer")) return null;

  const factura = await obtenerFacturaDeOrden(idOrden).catch(() => undefined);
  const pagada = factura?.estadoPago === "Pagado";

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-secondary">Cobro</h2>
          <p className="text-sm text-base-content/60">
            {factura ? `Factura #${factura.idFacturaEncabezado}` : "El vehículo está listo para entregarse."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-secondary">{formatearMoneda(factura?.totalPagado ?? totalEstimado)}</p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              pagada ? "bg-emerald-100 text-emerald-800" : factura ? "bg-amber-100 text-amber-800" : "bg-base-200 text-base-content/70"
            }`}
          >
            {pagada ? "Pagada" : factura ? "Pendiente de pago" : "Sin factura"}
          </span>
        </div>
      </div>

      {!factura && <p className="text-sm text-base-content/60">El total final incluye el IVA y se calcula al emitir la factura.</p>}

      {!pagada && (
        <AccionesCobro
          idOrden={idOrden}
          idFactura={factura?.idFacturaEncabezado}
          puedeFacturar={permisos.has("facturas.crear")}
          puedeRegistrarEfectivo={permisos.has("facturas.registrar_pago_manual")}
        />
      )}
    </section>
  );
}
