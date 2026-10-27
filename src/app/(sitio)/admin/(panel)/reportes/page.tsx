import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verificarEmpleado } from "@/features/auth/dal";
import { obtenerSucursales } from "@/features/citas/dal";
import FormReportes from "@/features/reportes/components/FormReportes";

export const metadata: Metadata = {
  title: "Reportes | Los Santos Customs",
};

async function Contenido() {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);
  if (!permisos.has("reportes.ver")) redirect("/admin");

  const sucursales = permisos.has("sucursales.todas") ? await obtenerSucursales().catch(() => []) : [];
  return <FormReportes sucursales={sucursales} />;
}

export default function ReportesPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Reportes</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Reportes</h1>
        <p className="text-base-content/60">Elige el reporte y el periodo, y descárgalo en Excel o PDF</p>
      </div>

      <Suspense fallback={<div className="skeleton h-96 w-full rounded-3xl" aria-busy="true" />}>
        <Contenido />
      </Suspense>
    </div>
  );
}
