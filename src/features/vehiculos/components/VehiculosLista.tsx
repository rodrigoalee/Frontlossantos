import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { obtenerMisVehiculos } from "../dal";
import { formatearPlaca } from "../formato";
import type { Vehiculo } from "../types";

const COLUMNAS = ["Placa", "Marca", "Modelo", "Año"];

export default async function VehiculosLista() {
  let vehiculos: Vehiculo[];
  try {
    vehiculos = await obtenerMisVehiculos();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return <p className="text-sm text-base-content/60">Esta cuenta no pertenece a un cliente del taller.</p>;
    }
    throw error;
  }

  if (vehiculos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/60">
        Aún no registras vehículos.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[18rem] table-fixed text-center text-sm">
        <caption className="sr-only">Vehículos registrados</caption>
        <thead>
          <tr className="border-b border-base-300">
            {COLUMNAS.map((columna) => (
              <th
                key={columna}
                scope="col"
                className="border-l border-base-300 px-2 pb-2 text-base font-semibold text-secondary first:border-l-0"
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((vehiculo) => (
            <tr key={vehiculo.idVehiculo} className="transition-colors hover:bg-base-200/60">
              <td className="px-2 py-3 font-semibold tracking-wide break-words text-base-content/50">
                {formatearPlaca(vehiculo.placa)}
              </td>
              <td className="border-l border-base-300 px-2 py-3 font-semibold break-words text-base-content/50">
                {vehiculo.marca}
              </td>
              <td className="border-l border-base-300 px-2 py-3 font-semibold break-words text-base-content/50">
                {vehiculo.modelo}
              </td>
              <td className="border-l border-base-300 px-2 py-3 font-semibold text-base-content/50">
                {vehiculo.anio}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
