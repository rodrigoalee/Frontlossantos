import Link from "next/link";
import { redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import { ApiError } from "@/lib/api";
import { obtenerTodosLosRepuestos } from "../dal";
import type { Repuesto } from "../types";
import TablaRepuestos from "./TablaRepuestos";

function Encabezado({ subtitulo, puedeCrear }: { subtitulo: string; puedeCrear: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Repuestos</h1>
        <p className="text-base-content/60">{subtitulo}</p>
      </div>
      {puedeCrear && (
        <Link href="/admin/repuestos/nuevo" className="btn btn-primary rounded-full px-6">
          Nuevo repuesto
        </Link>
      )}
    </div>
  );
}

export default async function ListaRepuestos() {
  const usuario = await verificarEmpleado();
  const puedeCrear = usuario.permisos?.includes("repuestos.crear") ?? false;

  let repuestos: Repuesto[];
  try {
    repuestos = await obtenerTodosLosRepuestos();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <>
          <Encabezado subtitulo="Catálogo de repuestos del taller" puedeCrear={false} />
          <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
            No tienes permiso para consultar repuestos.
          </p>
        </>
      );
    }
    throw error;
  }

  const activos = repuestos.filter((repuesto) => repuesto.activo).length;

  return (
    <>
      <Encabezado
        subtitulo={`${activos === 1 ? "1 activo" : `${activos} activos`} de ${repuestos.length} en el catálogo`}
        puedeCrear={puedeCrear}
      />
      <TablaRepuestos repuestos={repuestos} />
    </>
  );
}

export function ListaRepuestosCargando() {
  return (
    <>
      <CargandoPantalla texto="Cargando repuestos…" />
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando repuestos">
        <h1 className="text-3xl font-bold text-secondary">Repuestos</h1>
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="overflow-hidden rounded-3xl border border-base-300">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-base-300 px-5 py-4">
            <div className="skeleton h-4 w-1/6" />
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-4 w-1/6" />
            <div className="skeleton h-4 w-1/12" />
          </div>
        ))}
      </div>
    </>
  );
}
