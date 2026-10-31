import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import Migas from "@/components/Migas";
import CargandoPantalla from "@/components/CargandoPantalla";
import { obtenerFacturas } from "@/features/facturacion/dal";
import TablaFacturas from "@/features/facturacion/components/TablaFacturas";
import type { FacturaLista } from "@/features/facturacion/types";
import { ApiError } from "@/lib/api";

export const metadata: Metadata = {
  title: "Facturación y pagos | Los Santos Customs",
};

async function ListaFacturas() {
  let facturas: FacturaLista[];
  try {
    facturas = await obtenerFacturas();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          No tienes permiso para consultar facturas.
        </p>
      );
    }
    throw error;
  }

  if (facturas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaFileInvoiceDollar aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-secondary">Aún no hay facturas</p>
          <p className="text-sm text-base-content/60">Se emiten desde el detalle de una orden finalizada, al entregar el vehículo.</p>
        </div>
      </div>
    );
  }

  return <TablaFacturas facturas={facturas} />;
}

export default function FacturacionPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Facturación y pagos" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Facturación y pagos</h1>
        <p className="text-base-content/60">Facturas emitidas, su estado y cómo se pagaron</p>
      </div>

      <Suspense
        fallback={
          <div className="overflow-hidden rounded-3xl border border-base-300" aria-busy="true">
            <CargandoPantalla texto="Cargando facturas…" />
            <div className="skeleton h-[560px] w-full rounded-none" />
          </div>
        }
      >
        <ListaFacturas />
      </Suspense>
    </div>
  );
}
