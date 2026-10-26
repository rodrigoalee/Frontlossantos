import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FaChevronDown } from "react-icons/fa6";
import FiltroEstadoCitas from "@/features/citas/components/FiltroEstadoCitas";
import ListaCitasTaller, { ListaCitasTallerCargando } from "@/features/citas/components/ListaCitasTaller";
import { leerFiltroCitas } from "@/features/citas/filtros";

export const metadata: Metadata = {
  title: "Citas | Los Santos Customs",
};

export default function CitasPage({ searchParams }: PageProps<"/admin/citas">) {
  const filtro = searchParams.then(({ estado }) => leerFiltroCitas(estado));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-base-content/60">
            <Link href="/admin" className="hover:text-secondary">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary">Citas</span>
          </p>
          <h1 className="mt-2 text-3xl font-bold text-secondary">Citas</h1>
          <p className="text-base-content/60">Revisa las visitas agendadas en el taller</p>
        </div>
        <Suspense
          fallback={
            <button type="button" disabled className="btn rounded-full px-5">
              Filtros
              <FaChevronDown aria-hidden className="size-3" />
            </button>
          }
        >
          {filtro.then(({ valor }) => (
            <FiltroEstadoCitas actual={valor} />
          ))}
        </Suspense>
      </div>

      <Suspense fallback={<ListaCitasTallerCargando />}>
        {filtro.then((actual) => (
          <ListaCitasTaller filtro={actual} />
        ))}
      </Suspense>
    </div>
  );
}
