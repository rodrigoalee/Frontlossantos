import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ListaCitas, { ListaCitasCargando } from "@/features/citas/components/ListaCitas";

export const metadata: Metadata = {
  title: "Mis citas | Los Santos Customs",
};

export default function PanelPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Mis citas</h1>
          <p className="text-base-content/60">Consulta el estado de tus visitas al taller</p>
        </div>
        <Link href="/panel/citas/nueva" className="btn btn-primary rounded-full px-6">
          Agendar cita
        </Link>
      </div>

      <Suspense fallback={<ListaCitasCargando />}>
        <ListaCitas />
      </Suspense>
    </div>
  );
}
