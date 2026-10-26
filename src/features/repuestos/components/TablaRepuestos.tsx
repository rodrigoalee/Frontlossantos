"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Repuesto } from "../types";

const HotRepuestos = dynamic(() => import("./HotRepuestos"), {
  ssr: false,
  loading: () => <div className="skeleton h-[560px] w-full rounded-none" aria-busy="true" />,
});

export default function TablaRepuestos({ repuestos }: { repuestos: Repuesto[] }) {
  const [visibles, setVisibles] = useState(repuestos.length);

  if (repuestos.length === 0) {
    return (
      <section className="rounded-3xl border border-base-300 bg-base-100 px-6 py-14 text-center text-sm text-base-content/60">
        Aún no hay repuestos en el catálogo.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      <div className="flex justify-end border-b border-base-300 px-4 py-3 sm:px-5">
        <p className="text-sm text-base-content/60" aria-live="polite">
          {visibles} {visibles === 1 ? "repuesto" : "repuestos"}
        </p>
      </div>

      <div className="p-3 sm:p-4">
        <HotRepuestos repuestos={repuestos} onConteo={setVisibles} />
      </div>
    </section>
  );
}
