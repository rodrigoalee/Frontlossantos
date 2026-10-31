import { redirect } from "next/navigation";
import { FaCalendarDays } from "react-icons/fa6";
import CargandoPantalla from "@/components/CargandoPantalla";
import { ApiError } from "@/lib/api";
import { obtenerCitasDelTaller, obtenerSucursales } from "../dal";
import { inicioDeHoy } from "../formato";
import type { CitaTaller, Sucursal } from "../types";
import TablaCitas from "./TablaCitas";

export default async function ListaCitasTaller() {
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

  // Orden inicial: las próximas primero (de la más cercana a la más lejana) y luego las anteriores.
  const hoy = inicioDeHoy();
  const proximas = citas.filter((cita) => new Date(cita.fechaHora) >= hoy);
  const anteriores = citas.filter((cita) => new Date(cita.fechaHora) < hoy).reverse();

  return <TablaCitas citas={[...proximas, ...anteriores]} sucursales={sucursales} />;
}

export function ListaCitasTallerCargando() {
  return (
    <div className="overflow-hidden rounded-3xl border border-base-300" aria-busy="true" aria-label="Cargando las citas">
      <CargandoPantalla texto="Cargando citas…" />
      <div className="skeleton h-[560px] w-full rounded-none" />
    </div>
  );
}
