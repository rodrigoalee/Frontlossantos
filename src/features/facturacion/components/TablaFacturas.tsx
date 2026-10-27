"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { FacturaLista } from "../types";

const HotFacturas = dynamic(() => import("./HotFacturas"), {
  ssr: false,
  loading: () => <div className="skeleton h-[560px] w-full rounded-none" aria-busy="true" />,
});

export default function TablaFacturas({ facturas }: { facturas: FacturaLista[] }) {
  const [visibles, setVisibles] = useState(facturas.length);

  return (
    <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      <div className="flex justify-end border-b border-base-300 px-4 py-3 sm:px-5">
        <p className="text-sm text-base-content/60" aria-live="polite">
          {visibles} {visibles === 1 ? "factura" : "facturas"}
        </p>
      </div>

      <div className="p-3 sm:p-4">
        <HotFacturas facturas={facturas} onConteo={setVisibles} />
      </div>
    </section>
  );
}
