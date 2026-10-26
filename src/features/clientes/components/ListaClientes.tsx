import Link from "next/link";
import { redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import { obtenerTodosLosVehiculos } from "@/features/vehiculos/dal";
import type { VehiculoLista } from "@/features/vehiculos/types";
import { ApiError } from "@/lib/api";
import { obtenerTodosLosClientes } from "../dal";
import type { ClienteConPlacas, ClienteResumen } from "../types";
import TablaClientes from "./TablaClientes";

function Encabezado({ subtitulo, puedeCrear }: { subtitulo: string; puedeCrear: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Clientes y vehículos</h1>
        <p className="text-base-content/60">{subtitulo}</p>
      </div>
      {puedeCrear && (
        <Link href="/admin/clientes/nuevo" className="btn btn-primary rounded-full px-6">
          Nuevo cliente
        </Link>
      )}
    </div>
  );
}

export default async function ListaClientes() {
  const usuario = await verificarEmpleado();
  const puedeCrear = usuario.permisos?.includes("clientes.crear") ?? false;
  const veVehiculos = usuario.permisos?.includes("vehiculos.leer") ?? false;

  let clientes: ClienteResumen[];
  let vehiculos: VehiculoLista[];
  try {
    [clientes, vehiculos] = await Promise.all([
      obtenerTodosLosClientes(),
      veVehiculos ? obtenerTodosLosVehiculos() : [],
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <>
          <Encabezado subtitulo="Directorio de clientes del taller" puedeCrear={false} />
          <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
            No tienes permiso para consultar clientes.
          </p>
        </>
      );
    }
    throw error;
  }

  const placasPorCliente = Map.groupBy(vehiculos, (vehiculo) => vehiculo.clienteId);
  const conPlacas: ClienteConPlacas[] = clientes.map((cliente) => ({
    ...cliente,
    placas: (placasPorCliente.get(cliente.idCliente) ?? []).map((vehiculo) => vehiculo.placa),
  }));

  return (
    <>
      <Encabezado
        subtitulo={clientes.length === 1 ? "1 registrado" : `${clientes.length} registrados`}
        puedeCrear={puedeCrear}
      />
      <TablaClientes clientes={conPlacas} conPlacas={veVehiculos} />
    </>
  );
}

export function ListaClientesCargando() {
  return (
    <>
      <CargandoPantalla texto="Cargando clientes…" />
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando clientes">
        <h1 className="text-3xl font-bold text-secondary">Clientes y vehículos</h1>
        <div className="skeleton h-4 w-28" />
      </div>
      <div className="overflow-hidden rounded-3xl border border-base-300">
        <div className="flex gap-3 border-b border-base-300 p-5">
          <div className="skeleton h-10 w-full max-w-md" />
          <div className="skeleton h-10 w-36" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-base-300 px-5 py-4">
            <div className="skeleton size-10 shrink-0 rounded-full" />
            <div className="skeleton h-4 w-1/4" />
            <div className="skeleton h-4 w-1/6" />
            <div className="skeleton h-4 w-1/4" />
          </div>
        ))}
      </div>
    </>
  );
}
