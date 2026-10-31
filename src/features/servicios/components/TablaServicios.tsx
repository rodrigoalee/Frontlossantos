"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ServicioCatalogo } from "../types";

const HotServicios = dynamic(() => import("./HotServicios"), {
  ssr: false,
  loading: () => <div className="skeleton h-[560px] w-full rounded-none" aria-busy="true" />,
});

export default function TablaServicios({ servicios }: { servicios: ServicioCatalogo[] }) {
  const [visibles, setVisibles] = useState(servicios.length);

  if (servicios.length === 0) {
    return (
      <section className="rounded-3xl border border-base-300 bg-base-100 px-6 py-14 text-center text-sm text-base-content/60">
        Aún no hay servicios en el catálogo.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      <div className="flex justify-end border-b border-base-300 px-4 py-3 sm:px-5">
      </div>

      <div className="p-3 sm:p-4">
        <HotServicios servicios={servicios} onConteo={setVisibles} />
      </div>
    </section>
  );
}
