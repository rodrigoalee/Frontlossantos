import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FaCarSide } from "react-icons/fa6";
import Migas from "@/components/Migas";
import CargandoPantalla from "@/components/CargandoPantalla";
import AgendarCitaWizard from "@/features/citas/components/AgendarCitaWizard";
import { obtenerServicios, obtenerSucursales } from "@/features/citas/dal";
import { obtenerMisVehiculos } from "@/features/vehiculos/dal";
import { ApiError } from "@/lib/api";

export const metadata: Metadata = {
  title: "Agendar cita | Los Santos Customs",
};

async function CargarWizard() {
  let datos;
  try {
    datos = await Promise.all([obtenerMisVehiculos(), obtenerSucursales(), obtenerServicios()]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          Esta cuenta no pertenece a un cliente del taller.
        </p>
      );
    }
    throw error;
  }

  const [vehiculos, sucursales, servicios] = datos;

  if (vehiculos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaCarSide aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-secondary">Primero registra tu vehículo</p>
          <p className="text-sm text-base-content/60">Para agendar necesitas al menos un vehículo en tu perfil.</p>
        </div>
        <Link href="/panel/perfil" className="btn btn-primary rounded-full px-6">
          Ir a Mi perfil
        </Link>
      </div>
    );
  }

  return <AgendarCitaWizard vehiculos={vehiculos} sucursales={sucursales} servicios={servicios} />;
}

export default function AgendarCitaPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Mis citas", href: "/panel" }, { etiqueta: "Agendar cita" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Agendar una cita</h1>
        <p className="text-base-content/60">
          Elige tu vehículo, la sede, el servicio y la fecha. El taller confirma la cita antes de tu visita.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="skeleton h-96 w-full rounded-3xl" aria-busy="true">
            <CargandoPantalla />
          </div>
        }
      >
        <CargarWizard />
      </Suspense>
    </div>
  );
}
