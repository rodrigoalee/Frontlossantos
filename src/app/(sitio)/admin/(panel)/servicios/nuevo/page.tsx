import type { Metadata } from "next";
import Migas from "@/components/Migas";
import NuevoServicioForm from "@/features/servicios/components/NuevoServicioForm";

export const metadata: Metadata = {
  title: "Nuevo servicio | Los Santos Customs",
};

export default function NuevoServicioPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <Migas ruta={[{ etiqueta: "Inicio", href: "/admin" }, { etiqueta: "Servicios", href: "/admin/servicios" }, { etiqueta: "Nuevo servicio" }]} />
        <h1 className="mt-2 text-3xl font-bold text-secondary">Nuevo servicio</h1>
        <p className="text-base-content/60">Agrégalo al catálogo. Queda activo y visible para los clientes de inmediato.</p>
      </div>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        <NuevoServicioForm />
      </section>
    </div>
  );
}
