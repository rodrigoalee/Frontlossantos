import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
      <p className="-mb-4 text-sm text-base-content/60">
        <Link href="/admin" className="hover:text-secondary">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/repuestos" className="hover:text-secondary">
          Repuestos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-secondary">Ficha</span>
      </p>

      <Suspense fallback={<FichaRepuestoCargando />}>
        {params.then(({ id }) => (
          <CargarFicha id={id} />
        ))}
      </Suspense>
    </div>
  );
}
