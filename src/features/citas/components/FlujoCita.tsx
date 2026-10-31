import Link from "next/link";
import { FaCircleCheck, FaCircleExclamation, FaHourglassHalf } from "react-icons/fa6";
import Stepper from "@/components/Stepper";
import NuevaCotizacionForm from "@/features/cotizaciones/components/NuevaCotizacionForm";
import RegistrarRespuestaCotizacion from "@/features/cotizaciones/components/RegistrarRespuestaCotizacion";
import TarjetaCotizacion from "@/features/cotizaciones/components/TarjetaCotizacion";
import { obtenerCotizacionesDeCitaTaller } from "@/features/cotizaciones/dal";
import AsignarMecanicoForm from "@/features/ordenes/components/AsignarMecanicoForm";
import RecibirVehiculoForm from "@/features/ordenes/components/RecibirVehiculoForm";
import { obtenerMecanicos, obtenerOrden } from "@/features/ordenes/dal";
import type { CitaTallerDetalle } from "../types";
import AccionesCita from "./AccionesCita";

const PASOS = ["Confirmar cita", "Recibir vehículo", "Asignar mecánico"] as const;
const PASOS_COTIZADA = ["Cotizar", "Aceptación", "Recibir vehículo", "Asignar mecánico"] as const;

function Espera({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 rounded-2xl bg-base-200/60 px-4 py-3 text-sm text-base-content/70">
      <FaHourglassHalf aria-hidden className="size-4 shrink-0" />
      {children}
    </p>
  );
}

export default async function FlujoCita({ cita, permisos }: { cita: CitaTallerDetalle; permisos: Set<string> }) {
  if (cita.estado === "Cancelada") return null;

  const cotizada = cita.servicioPersonalizado;
  const [orden, cotizaciones] = await Promise.all([
    cita.idOrden && permisos.has("ordenes.leer") ? obtenerOrden(cita.idOrden).catch(() => undefined) : undefined,
    cotizada && cita.estado === "Pendiente" ? obtenerCotizacionesDeCitaTaller(cita.idCita).catch(() => []) : [],
  ]);
  const pendiente = cotizaciones.find((c) => c.estado === "Pendiente");
  const rechazada = !pendiente && cotizaciones[0]?.estado === "Rechazada";

  const base = cita.estado === "Pendiente" ? 1 : !cita.idOrden ? 2 : orden?.mecanicoAsignado ? 4 : 3;
  const paso = cotizada ? (cita.estado === "Pendiente" ? (pendiente ? 2 : 1) : base + 1) : base;
  const pasoRecibir = cotizada ? 3 : 2;
  const pasoAsignar = pasoRecibir + 1;

  const puedeAsignar = paso === pasoAsignar && orden && orden.estado !== "Finalizado" && permisos.has("ordenes.asignar");
  const mecanicos = puedeAsignar ? await obtenerMecanicos(cita.sucursalId).catch(() => []) : [];
  const puedeCambiarEstado = permisos.has("citas.cambiar_estado");
  const acciones = puedeCambiarEstado && !cita.idOrden && (
    <AccionesCita idCita={cita.idCita} estado={cita.estado} puedeConfirmar={!cotizada} />
  );

  return (
    <div className="flex flex-col gap-6 border-t border-base-300 pt-6">
      <Stepper pasos={cotizada ? PASOS_COTIZADA : PASOS} paso={paso} />

      {cotizada && paso === 1 && (
        <>
          {rechazada && (
            <p className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <FaCircleExclamation aria-hidden className="size-4 shrink-0" />
              El cliente rechazó la cotización anterior. Envía una nueva o cancela la cita.
            </p>
          )}
          {permisos.has("ordenes.cotizar") ? (
            <NuevaCotizacionForm destino={{ tipo: "cita", id: cita.idCita }} siempreAbierto />
          ) : (
            <Espera>Pendiente de que el taller cotice el servicio.</Espera>
          )}
          {acciones}
        </>
      )}

      {cotizada && paso === 2 && pendiente && (
        <>
          <TarjetaCotizacion cotizacion={pendiente} />
          {puedeCambiarEstado ? (
            <RegistrarRespuestaCotizacion idCotizacion={pendiente.idCotizacion} total={pendiente.total} />
          ) : (
            <Espera>Esperando la respuesta del cliente.</Espera>
          )}
          {acciones}
        </>
      )}

      {!cotizada && paso === 1 &&
        (puedeCambiarEstado ? acciones : <Espera>Pendiente de que recepción la confirme.</Espera>)}

      {paso === pasoRecibir && (
        <>
          {permisos.has("ordenes.crear") ? (
            <RecibirVehiculoForm citaId={cita.idCita} />
          ) : (
            <Espera>Esperando que el vehículo llegue al taller.</Espera>
          )}
          {acciones}
        </>
      )}

      {paso === pasoAsignar &&
        (puedeAsignar && orden ? (
          <AsignarMecanicoForm idOrden={orden.idOrdenEncabezado} diagnostico={orden.diagnostico} mecanicos={mecanicos} />
        ) : (
          <Espera>Vehículo recibido. Un supervisor asignará el mecánico.</Espera>
        ))}

      {paso > pasoAsignar && (
        <p className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <FaCircleCheck aria-hidden className="size-4 shrink-0" />
          Asignada a {orden?.mecanicoAsignado}. Desde aquí sigue el mecánico.
        </p>
      )}

      {cita.idOrden && permisos.has("ordenes.leer") && (
        <Link href={`/admin/ordenes/${cita.idOrden}`} className="btn self-start rounded-full px-6">
          Ver orden #{cita.idOrden}
        </Link>
      )}
    </div>
  );
}
