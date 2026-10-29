import type { Metadata } from "next";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import ListaRepuestos, { ListaRepuestosCargando } from "@/features/repuestos/components/ListaRepuestos";

export const metadata: Metadata = {
  title: "Repuestos | Los Santos Customs",
};

export default function RepuestosPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Migas className="-mb-6" ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Repuestos" }]} />

      <Suspense fallback={<ListaRepuestosCargando />}>
        <ListaRepuestos />
      </Suspense>
    </div>
  );
}
