import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AbrirOrden from "@/features/ordenes/components/AbrirOrden";
import { DetalleOrdenCargando } from "@/features/ordenes/components/DetalleOrden";

export const metadata: Metadata = {
  title: "Abrir orden | Los Santos Customs",
};

function CargarCita({ cita }: { cita: string | string[] | undefined }) {
  const idCita = Number(Array.isArray(cita) ? cita[0] : cita);
  if (!Number.isInteger(idCita) || idCita <= 0) notFound();
  return <AbrirOrden idCita={idCita} />;
}

export default function NuevaOrdenPage({ searchParams }: PageProps<"/admin/ordenes/nueva">) {
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
          <span className="text-secondary">Abrir orden</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Abrir orden</h1>
        <p className="text-base-content/60">Registra lo que reporta el cliente y asigna un mecánico</p>
      </div>

      <Suspense fallback={<DetalleOrdenCargando />}>
        {searchParams.then(({ cita }) => (
          <CargarCita cita={cita} />
        ))}
      </Suspense>
    </div>
  );
}
