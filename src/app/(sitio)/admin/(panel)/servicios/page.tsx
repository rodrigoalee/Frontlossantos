import type { Metadata } from "next";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import ListaServicios, { ListaServiciosCargando } from "@/features/servicios/components/ListaServicios";

export const metadata: Metadata = {
  title: "Servicios | Los Santos Customs",
};

export default function ServiciosPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Migas className="-mb-6" ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Servicios" }]} />

      <Suspense fallback={<ListaServiciosCargando />}>
        <ListaServicios />
      </Suspense>
    </div>
  );
}
