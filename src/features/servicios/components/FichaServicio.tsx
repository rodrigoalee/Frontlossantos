import { notFound, redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import EstadoCatalogo from "@/components/EstadoCatalogo";
import { verificarEmpleado } from "@/features/auth/dal";
import { ApiError } from "@/lib/api";
import { darDeBajaServicio, reactivarServicio } from "../actions";
import { obtenerServicio } from "../dal";
import type { ServicioCatalogo } from "../types";
import DatosServicio from "./DatosServicio";

export default async function FichaServicio({ idServicio }: { idServicio: number }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);

  let servicio: ServicioCatalogo;
  try {
    servicio = await obtenerServicio(idServicio);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          No tienes permiso para consultar servicios.
        </p>
      );
    }
    throw error;
  }

  return (
    <>
      <h1 className="text-3xl font-bold break-words text-secondary">{servicio.nombre}</h1>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <DatosServicio servicio={servicio} puedeEditar={permisos.has("servicios.editar")} />
        <EstadoCatalogo
          activo={servicio.activo}
          descripcionActivo="Los clientes pueden elegirlo al agendar su cita y el taller puede agregarlo a las órdenes."
          descripcionBaja="No aparece al agendar citas ni al armar órdenes. Las citas y órdenes anteriores lo conservan."
          confirmacionBaja="¿Dar de baja este servicio? Los clientes dejarán de verlo al agendar. Podrás reactivarlo después."
          darDeBaja={permisos.has("servicios.baja") ? darDeBajaServicio.bind(null, servicio.idServicio) : undefined}
          reactivar={permisos.has("servicios.editar") ? reactivarServicio.bind(null, servicio.idServicio) : undefined}
        />
      </div>
    </>
  );
}

export function FichaServicioCargando() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando la ficha del servicio">
      <CargandoPantalla texto="Cargando servicio…" />
      <div className="skeleton h-8 w-1/2" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="skeleton h-56 rounded-3xl" />
        <div className="skeleton h-56 rounded-3xl" />
      </div>
    </div>
  );
}
