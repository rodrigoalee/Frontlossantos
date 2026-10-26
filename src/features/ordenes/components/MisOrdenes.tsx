import { redirect } from "next/navigation";
import { FaScrewdriverWrench } from "react-icons/fa6";
import { inicioDeHoy } from "@/features/citas/formato";
import { ApiError } from "@/lib/api";
import { obtenerOrdenes } from "../dal";
import type { OrdenLista } from "../types";
import BotonEstadoOrden from "./BotonEstadoOrden";
import OrdenCard from "./OrdenCard";

function Grupo({ titulo, ordenes, conEmpezar = false }: { titulo: string; ordenes: OrdenLista[]; conEmpezar?: boolean }) {
  if (ordenes.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-secondary">
        {titulo} <span className="text-base font-normal text-base-content/50">({ordenes.length})</span>
      </h2>
      {ordenes.map((orden) => (
        <div key={orden.idOrdenEncabezado} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <OrdenCard orden={orden} conMecanico={false} />
          {conEmpezar && <BotonEstadoOrden idOrden={orden.idOrdenEncabezado} estado={orden.estado} />}
        </div>
      ))}
    </section>
  );
}

export default async function MisOrdenes() {
  let ordenes: OrdenLista[];
  try {
    ordenes = await obtenerOrdenes({ asignadasAMi: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  const hoy = inicioDeHoy();
  const porEmpezar = ordenes.filter((orden) => orden.estado === "EnRecepcion");
  const enProceso = ordenes.filter((orden) => orden.estado === "EnProceso");
  const terminadasHoy = ordenes.filter(
    (orden) => orden.estado === "Finalizado" && orden.fechaFinalizacion && new Date(orden.fechaFinalizacion) >= hoy,
  );

  if (porEmpezar.length + enProceso.length + terminadasHoy.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaScrewdriverWrench aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-secondary">No tienes órdenes asignadas</p>
          <p className="text-sm text-base-content/60">Cuando recepción te asigne un carro, aparecerá aquí.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Grupo titulo="Por empezar" ordenes={porEmpezar} conEmpezar />
      <Grupo titulo="En proceso" ordenes={enProceso} />
      <Grupo titulo="Terminadas hoy" ordenes={terminadasHoy} />
    </div>
  );
}
