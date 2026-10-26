import Link from "next/link";
import { redirect } from "next/navigation";
import { FaClipboardList, FaMagnifyingGlass } from "react-icons/fa6";
import CargandoPantalla from "@/components/CargandoPantalla";
import { formatearHora, inicioDeHoy } from "@/features/citas/formato";
import type { CitaTaller } from "@/features/citas/types";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { ApiError } from "@/lib/api";
import { obtenerCitasSinOrden, obtenerOrdenes } from "../dal";
import type { FiltroOrdenes } from "../filtros";
import type { OrdenLista } from "../types";
import OrdenCard from "./OrdenCard";

const UN_DIA_MS = 24 * 60 * 60 * 1000;

function CitasSinOrden({ citas }: { citas: CitaTaller[] }) {
  if (citas.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-secondary">
          Citas de hoy sin orden <span className="text-base font-normal text-base-content/50">({citas.length})</span>
        </h2>
        <p className="text-sm text-base-content/60">Cuando el carro llegue, abre su orden y asígnale un mecánico.</p>
      </div>
      <ul className="flex flex-col gap-3">
        {citas.map((cita) => (
          <li
            key={cita.idCita}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-base-100 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-secondary">
                {formatearHora(cita.fechaHora)} · {formatearPlaca(cita.placa)}
              </p>
              <p className="text-sm text-base-content/60">
                {cita.nombreCliente}
                {cita.servicio && ` · ${cita.servicio}`}
              </p>
            </div>
            <Link href={`/admin/ordenes/nueva?cita=${cita.idCita}`} className="btn btn-primary btn-sm rounded-full px-5">
              Abrir orden
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function TableroOrdenes({
  filtro,
  busqueda,
  puedeAbrir,
}: {
  filtro: FiltroOrdenes;
  busqueda: string;
  puedeAbrir: boolean;
}) {
  let ordenes: OrdenLista[];
  let citas: CitaTaller[];
  try {
    const hoy = inicioDeHoy();
    [ordenes, citas] = await Promise.all([
      obtenerOrdenes({ estado: "estado" in filtro ? filtro.estado : undefined, busqueda }),
      puedeAbrir
        ? obtenerCitasSinOrden(hoy, new Date(hoy.getTime() + UN_DIA_MS)).catch(() => [])
        : Promise.resolve([]),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          {error.detalle ?? "No tienes permiso para consultar las órdenes."}
        </p>
      );
    }
    throw error;
  }

  const pendientes = citas.filter((cita) => cita.estado !== "Cancelada");

  return (
    <div className="flex flex-col gap-8">
      <CitasSinOrden citas={pendientes} />

      <form action="/admin/ordenes" className="flex gap-2">
        {"estado" in filtro && <input type="hidden" name="estado" value={filtro.valor} />}
        <label className="input grow rounded-full">
          <FaMagnifyingGlass aria-hidden className="size-3.5 opacity-50" />
          <input type="search" name="q" defaultValue={busqueda} placeholder="Buscar por placa o cliente" maxLength={100} />
        </label>
        <button type="submit" className="btn rounded-full px-5">
          Buscar
        </button>
      </form>

      {ordenes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
            <FaClipboardList aria-hidden className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-secondary">
              {busqueda || "estado" in filtro ? "No hay órdenes con ese filtro" : "Aún no hay órdenes de trabajo"}
            </p>
            <p className="text-sm text-base-content/60">Las órdenes se abren desde la cita cuando el carro llega al taller.</p>
          </div>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-secondary">
            Órdenes <span className="text-base font-normal text-base-content/50">({ordenes.length})</span>
          </h2>
          {ordenes.map((orden) => (
            <OrdenCard key={orden.idOrdenEncabezado} orden={orden} />
          ))}
        </section>
      )}
    </div>
  );
}

export function OrdenesCargando() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando las órdenes">
      <CargandoPantalla texto="Cargando órdenes…" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-2 rounded-3xl bg-base-200/40 px-7 py-5">
          <div className="flex justify-between gap-4">
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-5 w-24" />
          </div>
          <div className="skeleton h-4 w-1/3" />
          <div className="flex justify-between gap-4">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
