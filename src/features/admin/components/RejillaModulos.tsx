import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import { modulosPermitidos } from "../modulos";
import ModuloCard from "./ModuloCard";
import ModuloIcono from "./ModuloIcono";

// En pantallas táctiles (teléfono y tablet, aunque esté horizontal) se muestran solo los íconos;
// las tarjetas con botón quedan para computadora con mouse.
const CLASES_ICONOS = "grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:pointer-fine:hidden";
const CLASES_TARJETAS = "hidden gap-6 lg:pointer-fine:grid lg:pointer-fine:grid-cols-4";

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
    <>
      <nav aria-label="Módulos" className={CLASES_ICONOS}>
        {modulos.map((modulo) => (
          <ModuloIcono key={modulo.slug} modulo={modulo} />
        ))}
      </nav>
      <div className={CLASES_TARJETAS}>
        {modulos.map((modulo) => (
          <ModuloCard key={modulo.slug} modulo={modulo} />
        ))}
      </div>
    </>
  );
}

export function RejillaModulosCargando() {
  return (
    <div aria-busy="true" aria-label="Cargando módulos">
      <CargandoPantalla />
      <div className={CLASES_ICONOS}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-2">
            <div className="skeleton size-16 rounded-2xl sm:size-20" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
      <div className={CLASES_TARJETAS}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-4 rounded-3xl border border-base-300 p-6">
            <div className="skeleton size-20 rounded-2xl" />
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-10 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
