"use client";

import { FaCircleQuestion, FaTriangleExclamation } from "react-icons/fa6";
import Dialogo from "./Dialogo";

const BOTON = {
  peligro: "btn-error",
  exito: "btn-success",
  primario: "btn-primary",
  neutro: "btn-neutral",
} as const;

type Props = {
  titulo: string;
  mensaje?: React.ReactNode;
  textoConfirmar: string;
  textoCancelar?: string;
  tono?: keyof typeof BOTON;
  pendiente: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ConfirmacionAccion({
  titulo,
  mensaje,
  textoConfirmar,
  textoCancelar = "Cancelar",
  tono = "peligro",
  pendiente,
  onConfirmar,
  onCancelar,
}: Props) {
  const Icono = tono === "peligro" ? FaTriangleExclamation : FaCircleQuestion;

  return (
    <Dialogo
      titulo={titulo}
      mensaje={mensaje}
      icono={<Icono aria-hidden className={`size-10 ${tono === "peligro" ? "text-error" : "text-primary"}`} />}
      bloqueado={pendiente}
      onCerrar={onCancelar}
    >
      <button type="button" onClick={onConfirmar} disabled={pendiente} className={`btn ${BOTON[tono]} min-h-12 rounded-full sm:flex-1`}>
        {pendiente && <span className="loading loading-spinner loading-sm" />}
        {textoConfirmar}
      </button>
      <button type="button" onClick={onCancelar} disabled={pendiente} autoFocus className="btn min-h-12 rounded-full sm:flex-1">
        {textoCancelar}
      </button>
    </Dialogo>
  );
}
