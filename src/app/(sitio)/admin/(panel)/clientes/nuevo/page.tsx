import type { Metadata } from "next";
import Migas from "@/components/Migas";
import NuevoClienteForm from "@/features/clientes/components/NuevoClienteForm";

export const metadata: Metadata = {
  title: "Nuevo cliente | Los Santos Customs",
};

export default function NuevoClientePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Clientes", href: "/admin/clientes" }, { etiqueta: "Nuevo cliente" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Nuevo cliente</h1>
        <p className="text-base-content/60">Registra los datos de contacto del cliente. Sus vehículos se agregan después.</p>
      </div>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        <NuevoClienteForm />
      </section>
    </div>
  );
}
