"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ClienteConPlacas } from "../types";

const HotClientes = dynamic(() => import("./HotClientes"), {
  ssr: false,
  loading: () => <div className="skeleton h-[560px] w-full rounded-none" aria-busy="true" />,
});

type Props = {
  clientes: ClienteConPlacas[];
  conPlacas: boolean;
};

export default function TablaClientes({ clientes, conPlacas }: Props) {
  const [visibles, setVisibles] = useState(clientes.length);

  if (clientes.length === 0) {
    return (
      <section className="rounded-3xl border border-base-300 bg-base-100 px-6 py-14 text-center text-sm text-base-content/60">
        Aún no hay clientes registrados.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      <div className="flex justify-end border-b border-base-300 px-4 py-3 sm:px-5">
        <p className="text-sm text-base-content/60" aria-live="polite">
          {visibles} {visibles === 1 ? "cliente" : "clientes"}
        </p>
      </div>

      <div className="p-3 sm:p-4">
        <HotClientes clientes={clientes} conPlacas={conPlacas} onConteo={setVisibles} />
      </div>
    </section>
  );
}
