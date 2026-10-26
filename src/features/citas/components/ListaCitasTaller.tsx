import { redirect } from "next/navigation";
import { FaCalendarDays } from "react-icons/fa6";
import CargandoPantalla from "@/components/CargandoPantalla";
import { ApiError } from "@/lib/api";
import { obtenerCitasDelTaller, obtenerSucursales } from "../dal";
import type { FiltroCitas } from "../filtros";
import { inicioDeHoy } from "../formato";
import type { CitaTaller, Sucursal } from "../types";
import CitaTallerCard from "./CitaTallerCard";

function Grupo({ titulo, citas, sedes }: { titulo: string; citas: CitaTaller[]; sedes: Map<number, string> }) {
  if (citas.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-secondary">
        {titulo} <span className="text-base font-normal text-base-content/50">({citas.length})</span>
      </h2>
      {citas.map((cita) => (
        <CitaTallerCard key={cita.idCita} cita={cita} sede={sedes.get(cita.sucursalId)} />
      ))}
    </section>
  );
}

export default async function ListaCitasTaller({ filtro }: { filtro: FiltroCitas }) {
  let citas: CitaTaller[];
  let sucursales: Sucursal[];
  try {
    [citas, sucursales] = await Promise.all([obtenerCitasDelTaller(), obtenerSucursales().catch(() => [])]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          {error.detalle ?? "No tienes permiso para consultar las citas."}
        </p>
      );
    }
    throw error;
  }

  if (citas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaCalendarDays aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-secondary">Aún no hay citas agendadas</p>
          <p className="text-sm text-base-content/60">Cuando un cliente agende una visita, aparecerá aquí.</p>
        </div>
      </div>
    );
  }

  if ("estado" in filtro) {
    citas = citas.filter((cita) => cita.estado === filtro.estado);
    if (citas.length === 0) {
      return (
        <p className="rounded-3xl border border-dashed border-base-300 px-6 py-8 text-center text-sm text-base-content/60">
          No hay citas {filtro.etiqueta.toLowerCase()}.
        </p>
      );
    }
  }

  const sedes = new Map(sucursales.map((sucursal) => [sucursal.idSucursal, sucursal.nombre]));
  const hoy = inicioDeHoy();
  const proximas = citas.filter((cita) => new Date(cita.fechaHora) >= hoy);
  const anteriores = citas.filter((cita) => new Date(cita.fechaHora) < hoy).reverse();

  return (
    <div className="flex flex-col gap-10">
      {proximas.length === 0 && (
        <p className="rounded-3xl border border-dashed border-base-300 px-6 py-8 text-center text-sm text-base-content/60">
          No hay citas para hoy ni para los próximos días.
        </p>
      )}
      <Grupo titulo="Próximas" citas={proximas} sedes={sedes} />
      <Grupo titulo="Anteriores" citas={anteriores} sedes={sedes} />
    </div>
  );
}

export function ListaCitasTallerCargando() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando las citas">
      <CargandoPantalla texto="Cargando citas…" />
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
