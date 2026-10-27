import Link from "next/link";
import { FaScrewdriverWrench } from "react-icons/fa6";
import MenuOpciones from "./MenuOpciones";

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

type Props = {
  nombreCompleto: string;
  inicio?: string;
  conPerfil?: boolean;
  conAjustes?: boolean;
};

export default function PanelNavbar({ nombreCompleto, inicio = "/panel", conPerfil = true, conAjustes = false }: Props) {
  return (
    <header className="bg-neutral text-neutral-content">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={inicio} className="flex items-center gap-2">
          <FaScrewdriverWrench aria-hidden className="size-7" />
          <span className="text-xl font-bold">
            Los Santos <span className="text-sm font-semibold">Customs</span>
          </span>
        </Link>

        <MenuOpciones iniciales={iniciales(nombreCompleto)} conPerfil={conPerfil} conAjustes={conAjustes} />
      </nav>
    </header>
  );
}
