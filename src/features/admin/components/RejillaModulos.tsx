import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import { modulosPermitidos } from "../modulos";
import ModuloCard from "./ModuloCard";

export default async function RejillaModulos() {
  const usuario = await verificarEmpleado();
  const modulos = modulosPermitidos(usuario.permisos);

  if (modulos.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center text-sm text-base-content/60">
        Tu cuenta aún no tiene acceso a ningún módulo. Pide a un administrador que te asigne un rol.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {modulos.map((modulo) => (
        <ModuloCard key={modulo.slug} modulo={modulo} />
      ))}
    </div>
  );
}

export function RejillaModulosCargando() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando módulos">
      <CargandoPantalla />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col gap-5 rounded-3xl border border-base-300 p-6">
          <div className="flex items-center gap-3">
            <div className="skeleton size-9 rounded-lg" />
            <div className="skeleton h-5 w-1/2" />
          </div>
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-10 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
