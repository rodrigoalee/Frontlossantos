import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FaPlus } from "react-icons/fa6";
import Migas from "@/components/Migas";
import { verificarEmpleado } from "@/features/auth/dal";
import ListaCitasTaller, { ListaCitasTallerCargando } from "@/features/citas/components/ListaCitasTaller";

export const metadata: Metadata = {
  title: "Citas | Los Santos Customs",
};

async function BotonNuevaCita() {
  const usuario = await verificarEmpleado();
  if (!usuario.permisos?.includes("citas.crear")) return null;

  return (
    <Link href="/admin/citas/nueva" className="btn btn-primary rounded-full px-5">
      <FaPlus aria-hidden className="size-3" />
      Nueva cita
    </Link>
  );
}

export default function CitasPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Citas" }]} />
          <h1 className="mt-2 text-3xl font-bold text-secondary">Citas</h1>
          <p className="text-base-content/60">Revisa las visitas agendadas en el taller</p>
        </div>
        <Suspense fallback={null}>
          <BotonNuevaCita />
        </Suspense>
      </div>

      <Suspense fallback={<ListaCitasTallerCargando />}>
        <ListaCitasTaller />
      </Suspense>
    </div>
  );
}
