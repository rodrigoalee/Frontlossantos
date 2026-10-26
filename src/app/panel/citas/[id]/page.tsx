import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SeguimientoCita, { SeguimientoCitaCargando } from "@/features/citas/components/SeguimientoCita";

export const metadata: Metadata = {
  title: "Seguimiento de cita | Los Santos Customs",
};

function CargarSeguimiento({ id }: { id: string }) {
  const idCita = Number(id);
  if (!Number.isInteger(idCita) || idCita <= 0) notFound();
  return <SeguimientoCita idCita={idCita} />;
}

export default function SeguimientoCitaPage({ params }: PageProps<"/panel/citas/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/panel" className="hover:text-secondary">
            Mis citas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Seguimiento</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Seguimiento de tu cita</h1>
        <p className="text-base-content/60">Consulta en qué paso va la atención de tu vehículo.</p>
      </div>

      <Suspense fallback={<SeguimientoCitaCargando />}>
        {params.then(({ id }) => (
          <CargarSeguimiento id={id} />
        ))}
      </Suspense>
    </div>
  );
}
