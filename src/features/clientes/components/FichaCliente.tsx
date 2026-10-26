import { notFound, redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import { agregarVehiculoACliente } from "@/features/vehiculos/actions";
import FilaVehiculo from "@/features/vehiculos/components/FilaVehiculo";
import RegistrarVehiculoForm from "@/features/vehiculos/components/RegistrarVehiculoForm";
import { ApiError } from "@/lib/api";
import { obtenerCliente } from "../dal";
import { formatearTelefono } from "../formato";
import type { ClienteDetalle } from "../types";
import DatoEditable, { type DatosCliente } from "./DatoEditable";

export default async function FichaCliente({ idCliente }: { idCliente: number }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);
  const puedeEditarCliente = permisos.has("clientes.editar");
  const puedeAgregarVehiculo = permisos.has("vehiculos.crear");
  const puedeEditarVehiculo = permisos.has("vehiculos.editar");
  const puedeEliminarVehiculo = permisos.has("vehiculos.eliminar");
  const conAcciones = puedeEditarVehiculo || puedeEliminarVehiculo;
  const columnas = ["Placa", "Marca", "Modelo", "Año", ...(conAcciones ? [""] : [])];

  let cliente: ClienteDetalle;
  try {
    cliente = await obtenerCliente(idCliente);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          No tienes permiso para consultar clientes.
        </p>
      );
    }
    throw error;
  }

  const datos: DatosCliente = {
    nombreCompleto: cliente.nombreCompleto,
    telefono: cliente.telefono,
    correo: cliente.correo,
    nit: cliente.nit ?? "",
  };
  const editable = { idCliente: cliente.idCliente, cliente: datos, puedeEditar: puedeEditarCliente };

  return (
    <>
      <h1 className="sr-only">{cliente.nombreCompleto}</h1>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-secondary">Datos de contacto</h2>
          <dl className="flex flex-col gap-4">
            <DatoEditable {...editable} campo="nombreCompleto" etiqueta="Nombre" maxLength={150}>
              {cliente.nombreCompleto}
            </DatoEditable>
            <div>
              <dt className="text-sm font-semibold text-base-content/50">Cliente</dt>
              <dd className="font-semibold text-secondary">#{cliente.idCliente}</dd>
            </div>
            <DatoEditable
              {...editable}
              campo="telefono"
              etiqueta="Teléfono"
              tipo="tel"
              maxLength={20}
              ayuda="Con código de país, por ejemplo +50255551234."
            >
              <a href={`tel:${cliente.telefono}`} className="hover:text-primary">
                {formatearTelefono(cliente.telefono)}
              </a>
            </DatoEditable>
            <DatoEditable {...editable} campo="correo" etiqueta="Correo" tipo="email" maxLength={100}>
              <a href={`mailto:${cliente.correo}`} className="hover:text-primary">
                {cliente.correo}
              </a>
            </DatoEditable>
            <DatoEditable {...editable} campo="nit" etiqueta="NIT" maxLength={20} ayuda="Déjalo vacío para consumidor final.">
              {cliente.nit ?? "Consumidor final"}
            </DatoEditable>
          </dl>
        </section>

        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-bold text-secondary">Vehículos</h2>
            <p className="text-sm text-base-content/60">
              {cliente.vehiculos.length === 1 ? "1 registrado" : `${cliente.vehiculos.length} registrados`}
            </p>
          </div>
          {cliente.vehiculos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/60">
              Este cliente aún no tiene vehículos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] table-fixed text-center text-sm">
                <caption className="sr-only">Vehículos del cliente</caption>
                <thead>
                  <tr className="border-b border-base-300">
                    {columnas.map((columna) => (
                      <th
                        key={columna || "acciones"}
                        scope="col"
                        className="border-l border-base-300 px-2 pb-2 text-base font-semibold text-secondary first:border-l-0"
                      >
                        {columna || <span className="sr-only">Acciones</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cliente.vehiculos.map((vehiculo) => (
                    <FilaVehiculo
                      key={vehiculo.idVehiculo}
                      vehiculo={vehiculo}
                      clienteId={cliente.idCliente}
                      puedeEditar={puedeEditarVehiculo}
                      puedeEliminar={puedeEliminarVehiculo}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {puedeAgregarVehiculo && (
            <div className="border-t border-base-300 pt-5">
              <RegistrarVehiculoForm accion={agregarVehiculoACliente.bind(null, cliente.idCliente)} />
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export function FichaClienteCargando() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando la ficha del cliente">
      <CargandoPantalla texto="Cargando ficha…" />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="skeleton h-56 rounded-3xl" />
        <div className="skeleton h-56 rounded-3xl" />
      </div>
    </div>
  );
}
