import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Migas from "@/components/Migas";
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
        <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Órdenes de trabajo", href: "/admin/ordenes" }, { etiqueta: "Detalle" }]} />
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
