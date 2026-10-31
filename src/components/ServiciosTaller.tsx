type Servicio = {
  titulo: string;
  descripcion: string;
};

const SERVICIOS_DEL_TALLER: Servicio[] = [
  {
    titulo: "Mecánica General",
    descripcion: "Diagnóstico, afinamiento, frenos, suspensión y cambio de aceite.",
  },
  {
    titulo: "Mantenimiento",
    descripcion: "Servicios preventivos para que tu vehículo no falle en el camino.",
  },
  {
    titulo: "Diagnóstico y Reparación",
    descripcion: "Detectamos y solucionamos problemas mecánicos.",
  },
];

export default function ServiciosTaller() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-4xl font-bold text-secondary">¿Qué Hacemos?</h2>

      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {SERVICIOS_DEL_TALLER.map((servicio) => (
          <li key={servicio.titulo} className="rounded-box border border-base-300 p-5">
            <h3 className="text-xl font-bold text-secondary">{servicio.titulo}</h3>
            <p className="mt-1 text-sm text-secondary">{servicio.descripcion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
