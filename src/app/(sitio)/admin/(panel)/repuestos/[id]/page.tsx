import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import FichaRepuesto, { FichaRepuestoCargando } from "@/features/repuestos/components/FichaRepuesto";

export const metadata: Metadata = {
  title: "Ficha del repuesto | Los Santos Customs",
};

function CargarFicha({ id }: { id: string }) {
  const idRepuesto = Number(id);
  if (!Number.isInteger(idRepuesto) || idRepuesto <= 0) notFound();
  return <FichaRepuesto idRepuesto={idRepuesto} />;
}

export default function FichaRepuestoPage({ params }: PageProps<"/admin/repuestos/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Migas className="-mb-4" ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Repuestos", href: "/admin/repuestos" }, { etiqueta: "Ficha" }]} />

      <Suspense fallback={<FichaRepuestoCargando />}>
        {params.then(({ id }) => (
          <CargarFicha id={id} />
        ))}
      </Suspense>
    </div>
  );
}
