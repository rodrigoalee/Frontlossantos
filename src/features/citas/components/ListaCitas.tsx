import Link from "next/link";
import { redirect } from "next/navigation";
import { FaCalendarPlus } from "react-icons/fa6";
import { ApiError } from "@/lib/api";
import { obtenerMisCitas } from "../dal";
import type { CitaPortal } from "../types";
import CitaCard from "./CitaCard";

export default async function ListaCitas() {
  let citas: CitaPortal[];
  try {
    citas = await obtenerMisCitas();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return <Aviso texto="Esta cuenta no pertenece a un cliente del taller, así que no tiene citas que mostrar." />;
    }
    throw error;
  }

  if (citas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaCalendarPlus aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-secondary">Aún no tienes citas</p>
          <p className="text-sm text-base-content/60">Agenda tu primera visita y aquí podrás darle seguimiento.</p>
        </div>
        <Link href="/panel/citas/nueva" className="btn btn-primary rounded-full px-6">
          Agendar cita
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {citas.map((cita) => (
        <CitaCard key={cita.idCita} cita={cita} />
      ))}
    </div>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">{texto}</p>
  );
}

export function ListaCitasCargando() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Cargando tus citas">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-4 rounded-3xl border border-base-300 p-6">
          <div className="skeleton h-6 w-2/3" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-4 w-3/5" />
          <div className="skeleton mt-2 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}
