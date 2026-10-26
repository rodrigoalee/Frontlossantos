import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { verificarEmpleado } from "@/features/auth/dal";
import { obtenerCitaDelTaller } from "@/features/citas/dal";
import { formatearFechaCita } from "@/features/citas/formato";
import type { CitaTallerDetalle } from "@/features/citas/types";
import { formatearTelefono } from "@/features/clientes/formato";
import { formatearPlaca } from "@/features/vehiculos/formato";
import { ApiError } from "@/lib/api";
import { obtenerMecanicos } from "../dal";
import type { MecanicoDisponible } from "../types";
import AbrirOrdenForm from "./AbrirOrdenForm";

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
      {children}
    </div>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-base-content/50">{etiqueta}</dt>
      <dd className="font-semibold break-words text-secondary">{children}</dd>
    </div>
  );
}

export default async function AbrirOrden({ idCita }: { idCita: number }) {
  const usuario = await verificarEmpleado();
  if (!usuario.permisos?.includes("ordenes.crear")) {
    return <Aviso>Tu cuenta no tiene permiso para abrir órdenes de trabajo.</Aviso>;
  }

  let cita: CitaTallerDetalle;
  let mecanicos: MecanicoDisponible[];
  try {
    cita = await obtenerCitaDelTaller(idCita);
    mecanicos = await obtenerMecanicos(cita.sucursalId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  if (cita.idOrden) redirect(`/admin/ordenes/${cita.idOrden}`);

  if (cita.estado === "Cancelada") {
    return (
      <Aviso>
        <p>Esta cita está cancelada; no se le puede abrir una orden.</p>
        <Link href={`/admin/citas/${cita.idCita}`} className="btn btn-sm rounded-full">
          Ver la cita
        </Link>
      </Aviso>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <section className="flex flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold text-secondary">Recepción del vehículo</h2>
        <AbrirOrdenForm citaId={cita.idCita} mecanicos={mecanicos} />
      </section>

      <aside className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-secondary">Datos de la cita</h2>
        <dl className="flex flex-col gap-4">
          <Dato etiqueta="Vehículo">
            {formatearPlaca(cita.placa)} · {cita.marca} {cita.modelo}
          </Dato>
          <Dato etiqueta="Cliente">
            {cita.nombreCliente}
            <span className="block font-normal text-base-content/70">{formatearTelefono(cita.telefonoCliente)}</span>
          </Dato>
          <Dato etiqueta="Servicio">{cita.servicio ?? "Sin servicio en la cita"}</Dato>
          <Dato etiqueta="Cita">{formatearFechaCita(cita.fechaHora)}</Dato>
          {cita.motivo && <Dato etiqueta="Motivo al agendar">{cita.motivo}</Dato>}
        </dl>
        <p className="text-xs text-base-content/50">El servicio de la cita entra solo como primera línea de la orden.</p>
      </aside>
    </div>
  );
}
