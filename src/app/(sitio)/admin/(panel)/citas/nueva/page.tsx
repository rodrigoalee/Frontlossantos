import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verificarEmpleado } from "@/features/auth/dal";
import { obtenerServicios, obtenerSucursales } from "@/features/citas/dal";
import { obtenerTodosLosClientes } from "@/features/clientes/dal";
import NuevaCitaTallerWizard from "@/features/mostrador/components/NuevaCitaTallerWizard";

export const metadata: Metadata = {
  title: "Nueva cita | Los Santos Customs",
};

async function Asistente() {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);
  if (!permisos.has("citas.crear") || !permisos.has("clientes.leer")) redirect("/admin/citas");

  // Quien trabaja en una sola sede agenda en la suya; solo quien ve todas elige.
  const [clientes, servicios, sedes] = await Promise.all([
    obtenerTodosLosClientes(),
    obtenerServicios(),
    permisos.has("sucursales.todas") ? obtenerSucursales() : [],
  ]);

  return <NuevaCitaTallerWizard clientes={clientes} servicios={servicios} sedes={sedes} />;
}

export default function NuevaCitaTallerPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/citas" className="hover:text-secondary">
            Citas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Nueva cita</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Nueva cita en el taller</h1>
        <p className="text-base-content/60">Para el cliente que llega al mostrador o llama por teléfono.</p>
      </div>

      <Suspense fallback={<div className="skeleton h-96 w-full rounded-3xl" aria-busy="true" />}>
        <Asistente />
      </Suspense>
    </div>
  );
}
