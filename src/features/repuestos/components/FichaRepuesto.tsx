import { notFound, redirect } from "next/navigation";
import CargandoPantalla from "@/components/CargandoPantalla";
import EstadoCatalogo from "@/components/EstadoCatalogo";
import { verificarEmpleado } from "@/features/auth/dal";
import { ApiError } from "@/lib/api";
import { darDeBajaRepuesto, reactivarRepuesto } from "../actions";
import { obtenerExistencias, obtenerRepuesto } from "../dal";
import type { ExistenciaSede, Repuesto } from "../types";
import DatosRepuesto from "./DatosRepuesto";
import FilaExistencia from "./FilaExistencia";

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/60">
      {children}
    </p>
  );
}

async function Existencias({ repuesto, puedeAjustar }: { repuesto: Repuesto; puedeAjustar: boolean }) {
  if (!repuesto.activo) {
    return <Aviso>Este repuesto está de baja. Reactívalo para asignarle existencias.</Aviso>;
  }

  let existencias: ExistenciaSede[];
  try {
    existencias = await obtenerExistencias(repuesto);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    console.error("Error al consultar existencias:", error);
    return <Aviso>No se pudieron cargar las existencias. Intenta más tarde.</Aviso>;
  }

  if (existencias.length === 0) {
    return <Aviso>No hay sedes a las que tengas acceso.</Aviso>;
  }

  const total = existencias.reduce((suma, existencia) => suma + existencia.cantidad, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[20rem] text-sm">
        <caption className="sr-only">Existencias del repuesto por sede</caption>
        <thead>
          <tr className="border-b border-base-300 text-base text-secondary">
            <th scope="col" className="px-3 pb-2 text-left font-semibold">
              Sede
            </th>
            <th scope="col" className="border-l border-base-300 px-3 pb-2 text-right font-semibold">
              Unidades
            </th>
            {puedeAjustar && (
              <th scope="col" className="border-l border-base-300 px-3 pb-2">
                <span className="sr-only">Acciones</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {existencias.map((existencia) => (
            <FilaExistencia
              key={existencia.idSucursal}
              existencia={existencia}
              idRepuesto={repuesto.idRepuesto}
              puedeAjustar={puedeAjustar}
            />
          ))}
        </tbody>
        {existencias.length > 1 && (
          <tfoot>
            <tr className="border-t border-base-300 font-semibold text-secondary">
              <th scope="row" className="px-3 pt-3 text-left">
                Total
              </th>
              <td className="px-3 pt-3 text-right tabular-nums">{total}</td>
              {puedeAjustar && <td />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default async function FichaRepuesto({ idRepuesto }: { idRepuesto: number }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);

  let repuesto: Repuesto;
  try {
    repuesto = await obtenerRepuesto(idRepuesto);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          No tienes permiso para consultar repuestos.
        </p>
      );
    }
    throw error;
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold break-words text-secondary">{repuesto.nombre}</h1>
        <p className="text-base-content/60">Código {repuesto.codigoStock}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          <DatosRepuesto repuesto={repuesto} puedeEditar={permisos.has("repuestos.editar")} />
          <EstadoCatalogo
            activo={repuesto.activo}
            descripcionActivo="Se puede agregar a las órdenes y tener existencias en cada sede."
            descripcionBaja="No aparece al armar órdenes ni se le asignan existencias. Las órdenes y facturas anteriores lo conservan."
            confirmacionBaja="Podrás reactivarlo después."
            darDeBaja={permisos.has("repuestos.baja") ? darDeBajaRepuesto.bind(null, repuesto.idRepuesto) : undefined}
            reactivar={permisos.has("repuestos.editar") ? reactivarRepuesto.bind(null, repuesto.idRepuesto) : undefined}
          />
        </div>

        <section className="flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-secondary">Existencias por sede</h2>
          {permisos.has("inventario.leer") ? (
            <Existencias repuesto={repuesto} puedeAjustar={permisos.has("inventario.ajustar")} />
          ) : (
            <Aviso>Tu cuenta no tiene permiso para consultar el inventario.</Aviso>
          )}
        </section>
      </div>
    </>
  );
}

export function FichaRepuestoCargando() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando la ficha del repuesto">
      <CargandoPantalla texto="Cargando repuesto…" />
      <div className="flex flex-col gap-2">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="skeleton h-72 rounded-3xl" />
        <div className="skeleton h-72 rounded-3xl" />
      </div>
    </div>
  );
}
