"use client";

import { useState } from "react";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import Dialogo from "./Dialogo";

type Props = {
  exito?: boolean;
  origen?: unknown;
  accion?: { texto: string; onClick: () => void };
  children: React.ReactNode;
};

export default function AvisoAccion({ exito = false, origen, accion, children }: Props) {
  const clave = origen ?? children;
  const [cerradoCon, setCerradoCon] = useState<unknown>();

  if (cerradoCon === clave) return null;

  const cerrar = () => setCerradoCon(clave);
  const Icono = exito ? FaCircleCheck : FaCircleExclamation;

  return (
    <Dialogo
      titulo={exito ? "¡Listo!" : "No se pudo completar"}
      mensaje={children}
      icono={<Icono aria-hidden className={`size-10 ${exito ? "text-emerald-600" : "text-error"}`} />}
      onCerrar={cerrar}
    >
      {accion && (
        <button
          type="button"
          onClick={() => {
            cerrar();
            accion.onClick();
          }}
          className="btn btn-primary min-h-12 rounded-full sm:flex-1"
        >
          {accion.texto}
        </button>
      )}
      <button
        type="button"
        onClick={cerrar}
        autoFocus
        className={`btn min-h-12 rounded-full sm:flex-1 ${accion ? "" : "btn-primary"}`}
      >
        {accion ? "Cerrar" : "Entendido"}
      </button>
    </Dialogo>
  );
}
