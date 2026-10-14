import Link from "next/link";
import { FaBars, FaHeadset, FaRegUser, FaUserPlus } from "react-icons/fa6";

const OPCIONES_DEL_MENU = [
  { texto: "Iniciar Sesión", href: "/login", Icono: FaRegUser },
  { texto: "Registrarse", href: "/registro", Icono: FaUserPlus },
  { texto: "Contáctanos", href: "#contacto", Icono: FaHeadset },
];

export default function MenuMovil() {
  return (
    <div className="dropdown dropdown-end sm:hidden">
      <div tabIndex={0} role="button" aria-label="Abrir menú" className="btn btn-ghost btn-square">
        <FaBars className="size-7 text-primary" />
      </div>

      <ul
        tabIndex={-1}
        className="dropdown-content menu z-10 mt-3 w-56 gap-2 rounded-box border border-base-300 bg-neutral p-3 shadow-lg">
        {OPCIONES_DEL_MENU.map(({ texto, href, Icono }) => (
          <li key={href}>
            <Link href={href} className="gap-4">
              <span className="grid size-10 place-items-center rounded-full bg-primary text-neutral">
                <Icono aria-hidden className="size-5" />
              </span>
              {texto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
