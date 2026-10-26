import { CORREO_TALLER, TELEFONO_TALLER } from "@/lib/contacto";

const HORARIO_DE_ATENCION = [
  { dias: "Lunes a Viernes", horas: "8:00 – 18:00" },
  { dias: "Sábado", horas: "8:00 – 13:00" },
  { dias: "Domingo", horas: "Cerrado" },
];


export default function HorarioYContacto() {
  return (
    <section
      id="contacto"
      className="border-t border-base-300 scroll-mt-4"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-secondary">Horario</h2>
          <ul className="mt-4 max-w-sm text-sm">
            {HORARIO_DE_ATENCION.map((horario) => (
              <li key={horario.dias} className="flex justify-between border-t border-base-300 py-1.5">
                <span>{horario.dias}</span>
                <span>{horario.horas}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-3xl font-semibold text-secondary">Contacto</h2>
          <dl className="mt-4 text-sm">
            <dt className="text-base-content/60">Teléfono</dt>
            <dd className="mb-3">
              <a href={`tel:${TELEFONO_TALLER}`} className="link-hover">{TELEFONO_TALLER}</a>
            </dd>
            <dt className="text-base-content/60">Correo</dt>
            <dd>
              <a href={`mailto:${CORREO_TALLER}`} className="link-hover">{CORREO_TALLER}</a>
            </dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
