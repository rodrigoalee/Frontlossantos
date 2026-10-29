import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

type Miga = { etiqueta: string; href?: string };

type Props = {
  /** De la raíz a la página actual; la última va sin href. */
  ruta: Miga[];
  className?: string;
};

// El botón vuelve al nivel anterior de la ruta, no al historial: quien entra desde el enlace
// del SMS o del correo no tiene "atrás" dentro de la app.
export default function Migas({ ruta, className }: Props) {
  const anterior = ruta.findLast((miga) => miga.href);

  return (
    <div className={className}>
      <nav aria-label="Ruta de navegación" className="text-sm text-base-content/60">
        <ol className="flex flex-wrap items-center">
          {ruta.map((miga, i) => (
            <li key={`${i}-${miga.etiqueta}`} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="mx-2">
                  /
                </span>
              )}
              {miga.href ? (
                <Link href={miga.href} className="hover:text-secondary">
                  {miga.etiqueta}
                </Link>
              ) : (
                <span aria-current="page" className="text-secondary">
                  {miga.etiqueta}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {anterior?.href && (
        <Link
          href={anterior.href}
          className="btn btn-sm mt-3 gap-2 rounded-full border-base-300 bg-base-100 font-medium shadow-none hover:border-secondary hover:text-secondary"
        >
          <FaArrowLeft aria-hidden className="size-3" />
          Volver a {anterior.etiqueta}
        </Link>
      )}
    </div>
  );
}
