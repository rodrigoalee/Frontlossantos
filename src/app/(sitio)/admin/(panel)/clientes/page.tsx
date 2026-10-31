import type { Metadata } from "next";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import ListaClientes, { ListaClientesCargando } from "@/features/clientes/components/ListaClientes";

export const metadata: Metadata = {
  title: "Clientes | Los Santos Customs",
};

export default function ClientesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Migas className="-mb-6" ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Clientes" }]} />

      <Suspense fallback={<ListaClientesCargando />}>
        <ListaClientes />
      </Suspense>
    </div>
  );
}
