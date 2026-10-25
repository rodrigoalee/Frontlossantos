"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaArrowRightFromBracket, FaChevronDown, FaGear, FaRegUser } from "react-icons/fa6";
import { cerrarSesion } from "@/features/auth/actions";

function IconoCirculo({ Icono }: { Icono: IconType }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-neutral">
      <Icono aria-hidden className="size-4" />
    </span>
  );
}

const CLASE_OPCION =
  "flex w-full cursor-pointer items-center gap-4 rounded-2xl p-1 text-left text-sm transition-colors hover:bg-neutral-content/10";

export default function MenuOpciones({ iniciales, conPerfil }: { iniciales: string; conPerfil: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    function alPresionarFuera(evento: PointerEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }

    document.addEventListener("pointerdown", alPresionarFuera);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("pointerdown", alPresionarFuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className={`dropdown dropdown-end ${abierto ? "dropdown-open" : "dropdown-close"}`}>
      <button
        type="button"
        aria-label="Abrir opciones"
        aria-expanded={abierto}
        aria-controls="menu-opciones"
        onClick={() => setAbierto((valor) => !valor)}
        className="flex cursor-pointer items-center gap-3"
      >
        <span className="hidden items-center gap-1.5 text-sm font-semibold sm:flex">
          <FaGear aria-hidden className="size-3.5" />
          Opciones
          <FaChevronDown aria-hidden className={`size-3 transition-transform ${abierto ? "rotate-180" : ""}`} />
        </span>
        <span className="grid size-11 place-items-center rounded-full bg-primary text-sm font-bold text-neutral">
          {iniciales}
        </span>
      </button>

      <ul
        id="menu-opciones"
        className="dropdown-content z-10 mt-3 w-60 space-y-2 rounded-3xl border border-neutral-content/30 bg-neutral p-4 text-neutral-content shadow-lg"
      >
        {conPerfil && (
          <li>
            <Link href="/panel/perfil" onClick={() => setAbierto(false)} className={CLASE_OPCION}>
              <IconoCirculo Icono={FaRegUser} />
              Mi perfil
            </Link>
          </li>
        )}
        <li>
          <form action={cerrarSesion}>
            <button type="submit" className={CLASE_OPCION}>
              <IconoCirculo Icono={FaArrowRightFromBracket} />
              Cerrar sesión
            </button>
          </form>
        </li>
      </ul>
    </div>
  );
}
