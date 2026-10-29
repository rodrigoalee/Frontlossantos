import Image from "next/image";
import { FaXmark } from "react-icons/fa6";
import type { FotoOrden } from "../types";

type Props = {
  fotos: FotoOrden[];
  /** Solo en la vista del taller: muestra la X para quitar cada foto. */
  alQuitar?: (foto: FotoOrden) => void;
  quitando?: number;
};

/** Cuadrícula de fotos del diagnóstico; cada una abre la imagen completa en otra pestaña. */
export default function GaleriaFotos({ fotos, alQuitar, quitando }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {fotos.map((foto) => (
        <li key={foto.idFoto} className="flex flex-col gap-1">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-base-200">
            <a href={foto.url} target="_blank" rel="noopener noreferrer" aria-label={`Ver foto completa${foto.descripcion ? `: ${foto.descripcion}` : ""}`}>
              {/* Ya vienen reducidas desde el celular; optimizarlas otra vez solo gastaría cuota de Vercel. */}
              <Image
                src={foto.url}
                alt={foto.descripcion ?? "Foto del vehículo"}
                fill
                unoptimized
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform hover:scale-105"
              />
            </a>
            {alQuitar && (
              <button
                type="button"
                onClick={() => alQuitar(foto)}
                disabled={quitando !== undefined}
                aria-label="Quitar foto"
                className="btn btn-circle btn-xs absolute top-2 right-2 border-0 bg-neutral/70 text-neutral-content hover:bg-neutral"
              >
                {quitando === foto.idFoto ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <FaXmark aria-hidden className="size-3" />
                )}
              </button>
            )}
          </div>
          {foto.descripcion && <p className="text-xs break-words text-base-content/70">{foto.descripcion}</p>}
        </li>
      ))}
    </ul>
  );
}
