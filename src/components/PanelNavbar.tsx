import Link from "next/link";
import { FaArrowRightFromBracket, FaChevronDown, FaGear, FaScrewdriverWrench } from "react-icons/fa6";
import { cerrarSesion } from "@/features/auth/actions";
import type { UsuarioSesion } from "@/features/auth/types";

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

export default function PanelNavbar({ usuario }: { usuario: UsuarioSesion }) {
  return (
    <header className="bg-neutral text-neutral-content">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/panel" className="flex items-center gap-2">
          <FaScrewdriverWrench aria-hidden className="size-7" />
          <span className="text-xl font-bold">
            Los Santos <span className="text-sm font-semibold">Customs</span>
          </span>
        </Link>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="flex cursor-pointer items-center gap-3">
            <span className="hidden items-center gap-1.5 text-sm font-semibold sm:flex">
              <FaGear aria-hidden className="size-3.5" />
              Opciones
              <FaChevronDown aria-hidden className="size-3" />
            </span>
            <span
              aria-label={`Menú de ${usuario.nombreCompleto}`}
              className="grid size-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-content"
            >
              {iniciales(usuario.nombreCompleto)}
            </span>
          </div>

          <div
            tabIndex={-1}
            className="dropdown-content z-10 mt-3 w-64 rounded-box border border-base-300 bg-base-100 p-2 text-base-content shadow-lg"
          >
            <div className="px-3 py-2">
              <p className="truncate font-semibold text-secondary">{usuario.nombreCompleto}</p>
              <p className="truncate text-xs text-base-content/60">{usuario.correo}</p>
            </div>
            <form action={cerrarSesion} className="border-t border-base-300 pt-2">
              <button type="submit" className="btn btn-ghost btn-sm w-full justify-start gap-3 font-medium">
                <FaArrowRightFromBracket aria-hidden className="size-4" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </nav>
    </header>
  );
}
