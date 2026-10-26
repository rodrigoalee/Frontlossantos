import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
      <p className="-mb-4 text-sm text-base-content/60">
        <Link href="/admin" className="hover:text-secondary">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/clientes" className="hover:text-secondary">
          Clientes
        </Link>
        <span className="mx-2">/</span>
        <span className="text-secondary">Ficha</span>
      </p>

      <Suspense fallback={<FichaClienteCargando />}>
        {params.then(({ id }) => (
          <CargarFicha id={id} />
        ))}
      </Suspense>
    </div>
  );
}
