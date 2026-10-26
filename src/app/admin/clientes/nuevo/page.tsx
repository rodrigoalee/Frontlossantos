import type { Metadata } from "next";
import Link from "next/link";
import NuevoClienteForm from "@/features/clientes/components/NuevoClienteForm";

export const metadata: Metadata = {
  title: "Nuevo cliente | Los Santos Customs",
};

export default function NuevoClientePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-base-content/60">
          <Link href="/admin" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/clientes" className="hover:text-secondary">
            Clientes
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary">Nuevo cliente</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-secondary">Nuevo cliente</h1>
        <p className="text-base-content/60">Registra los datos de contacto del cliente. Sus vehículos se agregan después.</p>
      </div>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        <NuevoClienteForm />
      </section>
    </div>
  );
}
