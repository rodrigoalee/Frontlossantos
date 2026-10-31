import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Migas from "@/components/Migas";
import CargandoPantalla from "@/components/CargandoPantalla";
import { verificarEmpleado } from "@/features/auth/dal";
import SeccionRoles from "@/features/usuarios/components/SeccionRoles";
import SeccionUsuarios from "@/features/usuarios/components/SeccionUsuarios";

export const metadata: Metadata = {
  title: "Ajustes | Los Santos Customs",
};

type Consulta = { tab?: string | string[]; rol?: string | string[]; editar?: string | string[]; gestionar?: string | string[] };

function primero(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

function Pestanas({ actual, conUsuarios, conRoles }: { actual: "usuarios" | "roles"; conUsuarios: boolean; conRoles: boolean }) {
  const pestanas = [
    ...(conUsuarios ? [{ valor: "usuarios", etiqueta: "Usuarios", href: "/admin/ajustes" }] : []),
    ...(conRoles ? [{ valor: "roles", etiqueta: "Roles y permisos", href: "/admin/ajustes?tab=roles" }] : []),
  ];

  return (
    <nav aria-label="Secciones" className="grid grid-cols-2 gap-1.5 sm:flex sm:gap-2">
      {pestanas.map((pestana) => {
        const activa = pestana.valor === actual;
        return (
          <Link
            key={pestana.valor}
            href={pestana.href}
            aria-current={activa ? "page" : undefined}
            className={`flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition-colors sm:text-base ${
              activa ? "bg-secondary text-secondary-content" : "bg-base-200 text-secondary hover:bg-base-300"
            }`}
          >
            {pestana.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

async function Contenido({ consulta }: { consulta: Promise<Consulta> }) {
  const usuario = await verificarEmpleado();
  const permisos = new Set(usuario.permisos ?? []);
  const conUsuarios = permisos.has("usuarios.leer");
  const conRoles = permisos.has("roles.leer") && permisos.has("permisos.leer");

  if (!conUsuarios && !conRoles) {
    return (
      <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
        Tu cuenta no tiene permiso para administrar usuarios ni roles.
      </p>
    );
  }

  const { tab, rol, editar, gestionar } = await consulta;
  const actual = (primero(tab) === "roles" && conRoles) || !conUsuarios ? "roles" : "usuarios";
  const idGestionar = Number(primero(gestionar));

  return (
    <>
      <Pestanas actual={actual} conUsuarios={conUsuarios} conRoles={conRoles} />
      {actual === "usuarios" ? (
        <SeccionUsuarios usuario={usuario} gestionar={Number.isInteger(idGestionar) ? idGestionar : undefined} />
      ) : (
        <SeccionRoles usuario={usuario} rolParam={primero(rol)} editar={primero(editar) === "1"} />
      )}
    </>
  );
}

export default function AjustesPage({ searchParams }: PageProps<"/admin/ajustes">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Ajustes" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Ajustes</h1>
        <p className="text-base-content/60">Crea las cuentas del personal y decide qué puede hacer cada rol</p>
      </div>

      <Suspense
        fallback={
          <>
            <CargandoPantalla texto="Cargando usuarios…" />
            <div className="skeleton h-[520px] w-full rounded-3xl" aria-busy="true" />
          </>
        }
      >
        <Contenido consulta={searchParams} />
      </Suspense>
    </div>
  );
}
