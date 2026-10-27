import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/facturacion" className="hover:text-secondary">
            Facturación y pagos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Detalle</span>
        </p>
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
