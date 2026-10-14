import Link from "next/link";
import { FaScrewdriverWrench } from "react-icons/fa6";
import MenuMovil from "./MenuMovil";

export default function Navbar() {
  return (
    <header className="bg-neutral text-neutral-content">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <FaScrewdriverWrench aria-hidden className="size-7" />
          <span className="text-xl font-bold">
            Los Santos <span className="text-sm font-semibold">Customs</span>
          </span>
        </Link>

        <div className="hidden gap-3 sm:flex">
          <Link href="/login" className="btn btn-primary btn-sm rounded-full px-6 sm:btn-md">
            Iniciar Sesión
          </Link>
          <Link href="/registro" className="btn btn-outline btn-primary btn-sm rounded-full px-6 sm:btn-md">
            Registrarse
          </Link>
        </div>
        <MenuMovil />
      </nav>
    </header>
  );
}
