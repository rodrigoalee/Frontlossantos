import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BotonRecorrido, { RecorridoPrimeraVez } from "@/components/Recorrido";
import ListaCitas, { ListaCitasCargando } from "@/features/citas/components/ListaCitas";

export const metadata: Metadata = {
  title: "Mis citas | Los Santos Customs",
};

export default function PanelPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div data-recorrido="citas">
          <h1 className="text-3xl font-bold text-secondary">Mis citas</h1>
          <p className="text-base-content/60">Consulta el estado de tus visitas al taller</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotonRecorrido nombre="panel" />
          <Link href="/panel/citas/nueva" data-recorrido="agendar" className="btn btn-primary rounded-full px-6">
            Agendar cita
          </Link>
        </div>
      </div>

      <Suspense fallback={<ListaCitasCargando />}>
        <ListaCitas />
        <RecorridoPrimeraVez nombre="panel" />
      </Suspense>
    </div>
  );
}
