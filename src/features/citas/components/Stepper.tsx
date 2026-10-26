import { FaCheck } from "react-icons/fa6";

const PASOS = ["Datos de la cita", "Confirmación"] as const;

export default function Stepper({ paso }: { paso: 1 | 2 }) {
  return (
    <ol className="flex items-start">
      {PASOS.map((etiqueta, i) => {
        const numero = i + 1;
        const hecho = numero < paso;
        const activo = numero === paso;
        return (
          <li key={etiqueta} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              <span className={`h-1 flex-1 ${i === 0 ? "invisible" : hecho || activo ? "bg-primary" : "bg-base-300"}`} />
              <span
                aria-current={activo ? "step" : undefined}
                className={`grid size-10 shrink-0 place-items-center rounded-full font-semibold ${
                  hecho || activo ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/60"
                }`}
              >
                {hecho ? <FaCheck aria-hidden className="size-4" /> : numero}
              </span>
              <span
                className={`h-1 flex-1 ${i === PASOS.length - 1 ? "invisible" : hecho ? "bg-primary" : "bg-base-300"}`}
              />
            </div>
            <span className={`text-sm ${activo ? "font-semibold text-secondary" : "text-base-content/60"}`}>
              {etiqueta}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
