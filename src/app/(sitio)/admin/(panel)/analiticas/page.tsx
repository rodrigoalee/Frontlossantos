import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FaChartLine } from "react-icons/fa6";
import { verificarEmpleado } from "@/features/auth/dal";

export const metadata: Metadata = {
  title: "Analíticas | Los Santos Customs",
};

// Solo se inserta un enlace de "Publicar en la web" de Power BI, nunca una URL cualquiera.
const PREFIJO_POWERBI = "https://app.powerbi.com/view?r=";

async function Tablero() {
  const usuario = await verificarEmpleado();
  if (!usuario.permisos?.includes("analiticas.ver")) redirect("/admin");

  const url = process.env.POWERBI_URL_REPORTE ?? "";
  if (!url.startsWith(PREFIJO_POWERBI)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
          <FaChartLine aria-hidden className="size-5" />
        </span>
        <div className="max-w-md">
          <p className="font-semibold text-secondary">El tablero aún no está configurado</p>
          <p className="text-sm text-base-content/60">
            En Power BI abre el reporte → Archivo → Insertar informe → Publicar en la web, copia el enlace y guárdalo en la
            variable de entorno <code>POWERBI_URL_REPORTE</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[75dvh] overflow-hidden rounded-3xl border border-base-300 bg-base-100 sm:h-auto sm:aspect-[16/10]">
      <iframe title="Tablero de analíticas del taller" src={url} className="size-full" allowFullScreen />
    </div>
  );
}

export default function AnaliticasPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Analíticas</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Analíticas</h1>
      </div>

      <Suspense fallback={<div className="skeleton h-[75dvh] w-full rounded-3xl sm:h-auto sm:aspect-[16/10]" aria-busy="true" />}>
        <Tablero />
      </Suspense>
    </div>
  );
}
