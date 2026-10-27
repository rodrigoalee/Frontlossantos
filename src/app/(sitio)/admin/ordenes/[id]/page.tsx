import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import DetalleOrden, { DetalleOrdenCargando } from "@/features/ordenes/components/DetalleOrden";

export const metadata: Metadata = {
  title: "Detalle de la orden | Los Santos Customs",
};

function CargarDetalle({ id }: { id: string }) {
  const idOrden = Number(id);
  if (!Number.isInteger(idOrden) || idOrden <= 0) notFound();
  return <DetalleOrden idOrden={idOrden} />;
}

export default function DetalleOrdenPage({ params }: PageProps<"/admin/ordenes/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/ordenes" className="hover:text-secondary">
            Órdenes de trabajo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Detalle</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Detalle de la orden</h1>
      </div>

      <Suspense fallback={<DetalleOrdenCargando />}>
        {params.then(({ id }) => (
          <CargarDetalle id={id} />
        ))}
      </Suspense>
    </div>
  );
}
