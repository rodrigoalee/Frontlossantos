import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

type Props = {
  pagina: number;
  totalPaginas: number;
  hrefPagina: (pagina: number) => string;
};

const CLASES_BOTON = "btn min-h-11 rounded-full px-4 sm:px-5";

export default function Paginador({ pagina, totalPaginas, hrefPagina }: Props) {
  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3">
      {pagina > 1 ? (
        <Link href={hrefPagina(pagina - 1)} rel="prev" className={CLASES_BOTON}>
          <FaChevronLeft aria-hidden className="size-3" />
          Anterior
        </Link>
      ) : (
        <span aria-disabled="true" className={`${CLASES_BOTON} btn-disabled`}>
          <FaChevronLeft aria-hidden className="size-3" />
          Anterior
        </span>
      )}

      <p className="text-sm text-base-content/70 sm:text-base">
        Página <span className="font-semibold text-secondary">{Math.min(pagina, totalPaginas)}</span> de {totalPaginas}
      </p>

      {pagina < totalPaginas ? (
        <Link href={hrefPagina(pagina + 1)} rel="next" className={CLASES_BOTON}>
          Siguiente
          <FaChevronRight aria-hidden className="size-3" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${CLASES_BOTON} btn-disabled`}>
          Siguiente
          <FaChevronRight aria-hidden className="size-3" />
        </span>
      )}
    </nav>
  );
}
