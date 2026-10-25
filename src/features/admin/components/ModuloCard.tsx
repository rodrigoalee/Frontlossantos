import Link from "next/link";
import type { Modulo } from "../modulos";

export default function ModuloCard({ modulo }: { modulo: Modulo }) {
  const { slug, titulo, descripcion, Icono } = modulo;

  return (
    <article className="group flex flex-col gap-5 rounded-3xl border border-base-300 bg-base-100 p-5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/15 text-secondary">
          <Icono aria-hidden className="size-4" />
        </span>
        <h2 className="text-lg font-semibold text-secondary">{titulo}</h2>
      </div>

      <p className="grow text-sm text-base-content/70">{descripcion}</p>

      <Link
        href={`/admin/${slug}`}
        aria-label={`Abrir ${titulo}`}
        className="btn rounded-full border-none bg-primary/10 font-semibold text-secondary shadow-none group-hover:bg-primary group-hover:text-primary-content focus-visible:bg-primary focus-visible:text-primary-content"
      >
        Abrir
      </Link>
    </article>
  );
}
