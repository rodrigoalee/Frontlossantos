import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { verificarEmpleado } from "@/features/auth/dal";
import FiltroEstadoOrdenes from "@/features/ordenes/components/FiltroEstadoOrdenes";
import MisOrdenes from "@/features/ordenes/components/MisOrdenes";
import TableroOrdenes, { OrdenesCargando } from "@/features/ordenes/components/TableroOrdenes";
import { type FiltroOrdenes, leerBusqueda, leerFiltroOrdenes } from "@/features/ordenes/filtros";

export const metadata: Metadata = {
  title: "Órdenes de trabajo | Los Santos Customs",
};

function Encabezado({ titulo, descripcion, children }: { titulo: string; descripcion: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">{titulo}</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">{titulo}</h1>
        <p className="text-base-content/60">{descripcion}</p>
      </div>
      {children}
    </div>
  );
}

async function Contenido({ consulta }: { consulta: Promise<{ filtro: FiltroOrdenes; busqueda: string }> }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);

  if (!permisos.has("ordenes.crear") && permisos.has("ordenes.trabajar")) {
    return (
      <>
        <Encabezado titulo="Mis órdenes" descripcion="Los carros que tienes asignados" />
        <MisOrdenes />
      </>
    );
  }

  const { filtro, busqueda } = await consulta;
  return (
    <>
      <Encabezado titulo="Órdenes de trabajo" descripcion="Recibe los carros, asígnalos y sigue su avance">
        <FiltroEstadoOrdenes actual={filtro.valor} />
      </Encabezado>
      <TableroOrdenes filtro={filtro} busqueda={busqueda} puedeAbrir={permisos.has("ordenes.crear")} />
    </>
  );
}

export default function OrdenesPage({ searchParams }: PageProps<"/admin/ordenes">) {
  const consulta = searchParams.then(({ estado, q }) => ({
    filtro: leerFiltroOrdenes(estado),
    busqueda: leerBusqueda(q),
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Suspense fallback={<OrdenesCargando />}>
        <Contenido consulta={consulta} />
      </Suspense>
    </div>
  );
}
