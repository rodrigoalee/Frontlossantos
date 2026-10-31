"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { CitaTaller, Sucursal } from "../types";

const HotCitas = dynamic(() => import("./HotCitas"), {
  ssr: false,
  loading: () => <div className="skeleton h-[560px] w-full rounded-none" aria-busy="true" />,
});

export default function TablaCitas({ citas, sucursales }: { citas: CitaTaller[]; sucursales: Sucursal[] }) {
  const [visibles, setVisibles] = useState(citas.length);
  const sedes = useMemo(() => new Map(sucursales.map((s) => [s.idSucursal, s.nombre])), [sucursales]);

  return (
    <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      <div className="flex justify-end border-b border-base-300 px-4 py-3 sm:px-5">
        <p className="text-sm text-base-content/60" aria-live="polite">
          {visibles} {visibles === 1 ? "cita" : "citas"}
        </p>
      </div>

      <div className="p-3 sm:p-4">
        <HotCitas citas={citas} sedes={sedes} onConteo={setVisibles} />
      </div>
    </section>
  );
}
