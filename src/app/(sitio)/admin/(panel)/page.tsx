import type { Metadata } from "next";
import { Suspense } from "react";
import RejillaModulos, { RejillaModulosCargando } from "@/features/admin/components/RejillaModulos";

export const metadata: Metadata = {
  title: "Panel del taller | Los Santos Customs",
};

export default function AdminPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Panel del taller</h1>
        <p className="text-base-content/60">Elige el módulo con el que quieres trabajar</p>
      </div>

      <Suspense fallback={<RejillaModulosCargando />}>
        <RejillaModulos />
      </Suspense>
    </div>
  );
}
