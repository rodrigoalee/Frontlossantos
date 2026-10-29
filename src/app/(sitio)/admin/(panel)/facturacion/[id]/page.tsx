import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import DetalleFactura from "@/features/facturacion/components/DetalleFactura";

export const metadata: Metadata = {
  title: "Detalle de factura | Los Santos Customs",
};

function CargarFactura({ id }: { id: string }) {
  const idFactura = Number(id);
  if (!Number.isInteger(idFactura) || idFactura <= 0) notFound();
  return <DetalleFactura idFactura={idFactura} />;
}

export default function DetalleFacturaPage({ params }: PageProps<"/admin/facturacion/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Facturación y pagos", href: "/admin/facturacion" }, { etiqueta: "Detalle" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Detalle de la factura</h1>
      </div>

      <Suspense fallback={<div className="skeleton h-96 w-full rounded-3xl" aria-busy="true" />}>
        {params.then(({ id }) => (
          <CargarFactura id={id} />
        ))}
      </Suspense>
    </div>
  );
}
