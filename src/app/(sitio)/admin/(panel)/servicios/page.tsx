import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ListaServicios, { ListaServiciosCargando } from "@/features/servicios/components/ListaServicios";

export const metadata: Metadata = {
  title: "Servicios | Los Santos Customs",
};

export default function ServiciosPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <p className="-mb-6 text-sm text-base-content/60">
        <Link href="/admin" className="hover:text-secondary">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-secondary">Servicios</span>
      </p>

      <Suspense fallback={<ListaServiciosCargando />}>
        <ListaServicios />
      </Suspense>
    </div>
  );
}
