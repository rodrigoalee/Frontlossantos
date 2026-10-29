import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import FichaCliente, { FichaClienteCargando } from "@/features/clientes/components/FichaCliente";

export const metadata: Metadata = {
  title: "Ficha del cliente | Los Santos Customs",
};

function CargarFicha({ id }: { id: string }) {
  const idCliente = Number(id);
  if (!Number.isInteger(idCliente) || idCliente <= 0) notFound();
  return <FichaCliente idCliente={idCliente} />;
}

export default function FichaClientePage({ params }: PageProps<"/admin/clientes/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Migas className="-mb-4" ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Clientes", href: "/admin/clientes" }, { etiqueta: "Ficha" }]} />

      <Suspense fallback={<FichaClienteCargando />}>
        {params.then(({ id }) => (
          <CargarFicha id={id} />
        ))}
      </Suspense>
    </div>
  );
}
