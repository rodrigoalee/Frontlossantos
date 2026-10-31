import type { Metadata } from "next";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import CargandoPantalla from "@/components/CargandoPantalla";
import BotonRecorrido, { RecorridoPrimeraVez } from "@/components/Recorrido";
import MisDatos from "@/features/perfil/components/MisDatos";
import RegistrarVehiculoForm from "@/features/vehiculos/components/RegistrarVehiculoForm";
import VehiculosLista from "@/features/vehiculos/components/VehiculosLista";

export const metadata: Metadata = {
  title: "Mi perfil | Los Santos Customs",
};

function Esqueleto({ filas, conPantalla = false }: { filas: number; conPantalla?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      {conPantalla && <CargandoPantalla texto="Cargando tu perfil…" />}
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="skeleton h-12 w-full" />
      ))}
    </div>
  );
}

export default function PerfilPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Migas ruta={[{ etiqueta: "Mis citas", href: "/panel" }, { etiqueta: "Mi perfil" }]} />
          <h1 className="mt-2 text-3xl font-bold text-secondary">Mi perfil</h1>
          <p className="text-base-content/60">Tus datos de contacto y los vehículos que traes al taller</p>
        </div>
        <BotonRecorrido nombre="perfil" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
        <section data-recorrido="mis-datos" className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-secondary">Mis datos</h2>
          <Suspense fallback={<Esqueleto filas={3} />}>
            <MisDatos />
          </Suspense>
        </section>

        <section className="flex flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-secondary">Mis vehículos</h2>
          <Suspense fallback={<Esqueleto filas={2} conPantalla />}>
            <VehiculosLista />
          </Suspense>
          <div data-recorrido="registrar-vehiculo" className="border-t border-base-300 pt-6">
            <RegistrarVehiculoForm conSiguientePaso />
          </div>
        </section>
      </div>
      <RecorridoPrimeraVez nombre="perfil" />
    </div>
  );
}
