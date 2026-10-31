import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import DetalleCitaTaller, { DetalleCitaTallerCargando } from "@/features/citas/components/DetalleCitaTaller";

export const metadata: Metadata = {
  title: "Detalle de la cita | Los Santos Customs",
};

function CargarDetalle({ id }: { id: string }) {
  const idCita = Number(id);
  if (!Number.isInteger(idCita) || idCita <= 0) notFound();
  return <DetalleCitaTaller idCita={idCita} />;
}

export default function DetalleCitaPage({ params }: PageProps<"/admin/citas/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Citas", href: "/admin/citas" }, { etiqueta: "Detalle" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Detalle de la cita</h1>
      </div>

      <Suspense fallback={<DetalleCitaTallerCargando />}>
        {params.then(({ id }) => (
          <CargarDetalle id={id} />
        ))}
      </Suspense>
    </div>
  );
}
