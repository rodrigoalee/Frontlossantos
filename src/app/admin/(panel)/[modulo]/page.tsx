import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FaHourglassHalf } from "react-icons/fa6";
import { MODULOS } from "@/features/admin/modulos";

export const metadata: Metadata = {
  title: "Próximamente | Los Santos Customs",
};

function Proximamente({ slug }: { slug: string }) {
  const modulo = MODULOS.find((m) => m.slug === slug);
  if (!modulo) notFound();

  return (
    <>
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Panel del taller
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">{modulo.titulo}</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">{modulo.titulo}</h1>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaHourglassHalf aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-secondary">Este módulo estará disponible pronto</p>
          <p className="text-sm text-base-content/60">Mientras tanto, puedes volver al panel y elegir otro.</p>
        </div>
        <Link href="/admin" className="btn btn-primary rounded-full px-6">
          Volver al panel
        </Link>
      </div>
    </>
  );
}

export default function ModuloPage({ params }: PageProps<"/admin/[modulo]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Suspense fallback={<div className="skeleton h-64 w-full rounded-3xl" aria-busy="true" />}>
        {params.then(({ modulo }) => (
          <Proximamente slug={modulo} />
        ))}
      </Suspense>
    </div>
  );
}
