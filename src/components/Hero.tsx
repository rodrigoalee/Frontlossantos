import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/taller-hero.jpg"
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/60" />

      <div className="mx-auto max-w-6xl px-4 py-20 text-white sm:py-28">
        <h1 className="text-5xl font-bold sm:text-7xl">
          Los Santos <span className="text-3xl font-semibold sm:text-4xl">Custom</span>
        </h1>

        <p className="mt-4 max-w-xl font-medium">
          Reparación, mantenimiento y personalización de vehículos. Cada ingreso queda registrado
          con su orden de trabajo, sus repuestos y su factura, para que sepas exactamente qué se
          le hizo a tu carro y cuánto costó.
        </p>
        <p className="mt-4 max-w-xl text-sm">
          Si ya eres cliente, entra a tu portal para agendar una cita y seguir en qué va tu vehículo.
          <br />
          Si trabajas aquí, entra al sistema de gestión.
        </p>

        <div className="mt-8 flex gap-4">
          <Link href="/login" className="btn btn-primary rounded-full px-8">
            Iniciar Sesión
          </Link>
          <a href="#contacto" className="btn rounded-full border-none bg-white px-8 text-primary">
            Contáctanos
          </a>
        </div>
      </div>
    </section>
  );
}
