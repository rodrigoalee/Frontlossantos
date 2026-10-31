import type { Metadata } from "next";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import { esMecanico, verificarEmpleado } from "@/features/auth/dal";
import FiltroEstadoOrdenes from "@/features/ordenes/components/FiltroEstadoOrdenes";
import MisOrdenes from "@/features/ordenes/components/MisOrdenes";
import TableroOrdenes, { OrdenesCargando } from "@/features/ordenes/components/TableroOrdenes";
import { leerBusqueda, leerFiltroMisOrdenes, leerFiltroOrdenes, leerPagina } from "@/features/ordenes/filtros";

type Consulta = { estado?: string | string[]; q?: string | string[]; pagina?: string | string[] };

export const metadata: Metadata = {
  title: "Órdenes de trabajo | Los Santos Customs",
};

function Encabezado({
  titulo,
  descripcion,
  conRuta = true,
  children,
}: {
  titulo: string;
  descripcion: string;
  conRuta?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {conRuta && (
          <Migas className="mb-2" ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: titulo }]} />
        )}
        <h1 className="text-3xl font-bold text-secondary">{titulo}</h1>
        <p className="text-base-content/60">{descripcion}</p>
      </div>
      {children}
    </div>
  );
}

async function Contenido({ consulta }: { consulta: Promise<Consulta> }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);
  const { estado, q, pagina } = await consulta;
  const busqueda = leerBusqueda(q);

  if (esMecanico(usuario)) {
    return (
      <>
        <Encabezado titulo="Mis órdenes" descripcion="Los carros que tienes asignados" conRuta={false} />
        <MisOrdenes filtro={leerFiltroMisOrdenes(estado)} busqueda={busqueda} pagina={leerPagina(pagina)} />
      </>
    );
  }

  const filtro = leerFiltroOrdenes(estado);
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
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <Suspense fallback={<OrdenesCargando />}>
        <Contenido consulta={searchParams} />
      </Suspense>
    </div>
  );
}
