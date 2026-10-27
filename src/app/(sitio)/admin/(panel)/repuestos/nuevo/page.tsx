import type { Metadata } from "next";
import Link from "next/link";
import NuevoRepuestoForm from "@/features/repuestos/components/NuevoRepuestoForm";

export const metadata: Metadata = {
  title: "Nuevo repuesto | Los Santos Customs",
};

export default function NuevoRepuestoPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/repuestos" className="hover:text-secondary">
            Repuestos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Nuevo repuesto</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Nuevo repuesto</h1>
        <p className="text-base-content/60">
          Agrégalo al catálogo. Las existencias de cada sede se cargan desde su ficha.
        </p>
      </div>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        <NuevoRepuestoForm />
      </section>
    </div>
  );
}
