import Link from "next/link";
import type { Modulo } from "../modulos";

export default function ModuloIcono({ modulo }: { modulo: Modulo }) {
  const { slug, titulo, Icono } = modulo;

  return (
    <Link
      href={`/admin/${slug}`}
      className="group flex flex-col items-center gap-2 rounded-2xl p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/15 text-secondary shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-content group-active:bg-primary group-active:text-primary-content sm:size-20">
        <Icono aria-hidden className="size-7 sm:size-8" />
      </span>
      <span className="text-sm leading-tight font-semibold text-secondary">{titulo}</span>
    </Link>
  );
}
