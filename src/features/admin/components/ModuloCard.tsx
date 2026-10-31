import Link from "next/link";
import type { Modulo } from "../modulos";

export default function ModuloCard({ modulo }: { modulo: Modulo }) {
  const { slug, titulo, Icono } = modulo;

  return (
    <Link
      href={`/admin/${slug}`}
      className="group flex flex-col items-center gap-4 rounded-3xl border border-base-300 bg-base-100 p-6 text-center transition hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="grid size-20 place-items-center rounded-2xl border border-primary/30 bg-primary/15 text-secondary transition-colors group-hover:bg-primary group-hover:text-primary-content">
        <Icono aria-hidden className="size-8" />
      </span>
      <h2 className="text-lg font-semibold text-secondary">{titulo}</h2>
    </Link>
  );
}
