import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import FichaServicio, { FichaServicioCargando } from "@/features/servicios/components/FichaServicio";

export const metadata: Metadata = {
  title: "Ficha del servicio | Los Santos Customs",
};

function CargarFicha({ id }: { id: string }) {
  const idServicio = Number(id);
  if (!Number.isInteger(idServicio) || idServicio <= 0) notFound();
  return <FichaServicio idServicio={idServicio} />;
}

export default function FichaServicioPage({ params }: PageProps<"/admin/servicios/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Migas className="-mb-4" ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Servicios", href: "/admin/servicios" }, { etiqueta: "Ficha" }]} />

      <Suspense fallback={<FichaServicioCargando />}>
        {params.then(({ id }) => (
          <CargarFicha id={id} />
        ))}
      </Suspense>
    </div>
  );
}
