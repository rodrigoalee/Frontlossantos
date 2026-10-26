"use client";

import Link from "next/link";
import { useRef } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import { FILTROS_ORDENES, type FiltroOrdenes } from "../filtros";

export default function FiltroEstadoOrdenes({ actual }: { actual: FiltroOrdenes["valor"] }) {
  const menu = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={menu} className="dropdown dropdown-end">
      <summary className="btn rounded-full px-5">
        Filtros
        <FaChevronDown aria-hidden className="size-3" />
      </summary>
      <ul className="dropdown-content menu z-10 mt-2 w-44 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-lg">
        {FILTROS_ORDENES.map((filtro) => {
          const activo = filtro.valor === actual;
          return (
            <li key={filtro.valor}>
              <Link
                href={filtro.valor === "todas" ? "/admin/ordenes" : `/admin/ordenes?estado=${filtro.valor}`}
                aria-current={activo ? "true" : undefined}
                onClick={() => menu.current?.removeAttribute("open")}
                className={`flex justify-between rounded-xl ${activo ? "bg-primary/15! font-semibold text-secondary!" : ""}`}
              >
                {filtro.etiqueta}
                {activo && <FaCheck aria-hidden className="size-3" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
