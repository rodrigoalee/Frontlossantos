import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verificarEmpleado } from "@/features/auth/dal";
import NuevoUsuarioWizard from "@/features/usuarios/components/NuevoUsuarioWizard";
import { obtenerRolesDelPersonal, obtenerSedes, permisosDeCadaRol } from "@/features/usuarios/dal";

export const metadata: Metadata = {
  title: "Nuevo usuario | Los Santos Customs",
};

async function Asistente() {
  const usuario = await verificarEmpleado();
  if (!usuario.permisos?.includes("usuarios.crear")) redirect("/admin/ajustes");

  const [roles, sedes] = await Promise.all([obtenerRolesDelPersonal(), obtenerSedes()]);
  const permisosPorRol = await permisosDeCadaRol(roles);

  return <NuevoUsuarioWizard roles={roles} sedes={sedes} permisosPorRol={permisosPorRol} />;
}

export default function NuevoUsuarioPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/ajustes" className="hover:text-secondary">
            Ajustes
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Nuevo usuario</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Nuevo usuario</h1>
        <p className="text-base-content/60">En cuatro pasos la persona queda lista para iniciar sesión.</p>
      </div>

      <Suspense fallback={<div className="skeleton h-96 w-full rounded-3xl" aria-busy="true" />}>
        <Asistente />
      </Suspense>
    </div>
  );
}
