import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
      <p className="-mb-4 text-sm text-base-content/60">
        <Link href="/admin" className="hover:text-secondary">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/servicios" className="hover:text-secondary">
          Servicios
        </Link>
        <span className="mx-2">/</span>
        <span className="text-secondary">Ficha</span>
      </p>

      <Suspense fallback={<FichaServicioCargando />}>
        {params.then(({ id }) => (
          <CargarFicha id={id} />
        ))}
      </Suspense>
    </div>
  );
}
