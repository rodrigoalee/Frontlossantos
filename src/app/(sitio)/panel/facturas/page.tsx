import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import Migas from "@/components/Migas";
import { formatearFechaCorta, formatearMoneda } from "@/features/citas/formato";
import BotonPagarFactura from "@/features/facturacion/components/BotonPagarFactura";
import { obtenerMisFacturas } from "@/features/facturacion/dal";
import type { FacturaPortal } from "@/features/facturacion/types";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { ApiError } from "@/lib/api";

export const metadata: Metadata = {
  title: "Mis facturas | Los Santos Customs",
};

async function ListaMisFacturas() {
  let facturas: FacturaPortal[];
  try {
    facturas = await obtenerMisFacturas();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  if (facturas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaFileInvoiceDollar aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-secondary">Aún no tienes facturas</p>
          <p className="text-sm text-base-content/60">Cuando recojas tu vehículo, tu factura aparecerá aquí.</p>
        </div>
      </div>
    );
  }

  const pendientes = facturas.filter((f) => !f.pagada);
  const pagadas = facturas.filter((f) => f.pagada);

  return (
    <div className="flex flex-col gap-8">
      {pendientes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-secondary">Por pagar</h2>
          {pendientes.map((factura) => (
            <article
              key={factura.idFactura}
              className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"
            >
              <div>
                <p className="text-lg font-semibold text-secondary">Factura #{factura.idFactura}</p>
                <p className="text-sm text-base-content/60">
                  {formatearPlaca(factura.placa)} · {formatearFechaCorta(factura.fechaEmision)}
                </p>
              </div>
              <BotonPagarFactura idFactura={factura.idFactura} total={factura.total} />
            </article>
          ))}
        </section>
      )}

      {pagadas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-secondary">Pagadas</h2>
          {pagadas.map((factura) => (
            <article
              key={factura.idFactura}
              className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-base-200/40 px-5 py-4 sm:px-7"
            >
              <div>
                <p className="font-semibold text-secondary">Factura #{factura.idFactura}</p>
                <p className="text-sm text-base-content/60">
                  {formatearPlaca(factura.placa)} · {formatearFechaCorta(factura.fechaEmision)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatearMoneda(factura.total)}</p>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">Pagada</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default function MisFacturasPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Mis citas", href: "/panel" }, { etiqueta: "Mis facturas" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Mis facturas</h1>
        <p className="text-base-content/60">Consulta y paga las facturas de tus visitas</p>
      </div>

      <Suspense fallback={<div className="skeleton h-48 w-full rounded-3xl" aria-busy="true" />}>
        <ListaMisFacturas />
      </Suspense>
    </div>
  );
}
