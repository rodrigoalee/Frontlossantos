"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { UsuarioResumen } from "../types";

const HotUsuarios = dynamic(() => import("./HotUsuarios"), {
  ssr: false,
  loading: () => <div className="skeleton h-[520px] w-full rounded-none" aria-busy="true" />,
});

export default function TablaUsuarios({ usuarios }: { usuarios: UsuarioResumen[] }) {
  const [visibles, setVisibles] = useState(usuarios.length);

  if (usuarios.length === 0) {
    return (
      <section className="rounded-3xl border border-base-300 bg-base-100 px-6 py-14 text-center text-sm text-base-content/60">
        Aún no hay usuarios del personal registrados.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      <div className="flex justify-end border-b border-base-300 px-4 py-3 sm:px-5">
        <p className="text-sm text-base-content/60" aria-live="polite">
          {visibles} {visibles === 1 ? "usuario" : "usuarios"}
        </p>
      </div>

      <div className="p-3 sm:p-4">
        <HotUsuarios usuarios={usuarios} onConteo={setVisibles} />
      </div>
    </section>
  );
}
