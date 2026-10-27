"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { useState, useTransition } from "react";
import { FaMoneyBillWave, FaWhatsapp } from "react-icons/fa6";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
import { facturarYEnviarEnlace, registrarPagoEfectivo, reenviarEnlace } from "../actions";
import type { ResultadoAccion } from "../types";

type Props = {
  idOrden: number;
  idFactura?: number;
  puedeFacturar: boolean;
  puedeRegistrarEfectivo: boolean;
};

export default function AccionesCobro({ idOrden, idFactura, puedeFacturar, puedeRegistrarEfectivo }: Props) {
  const [resultado, setResultado] = useState<ResultadoAccion>();
  const [confirmandoEfectivo, setConfirmandoEfectivo] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function ejecutar(accion: () => Promise<ResultadoAccion>) {
    setResultado(undefined);
    startTransition(async () => {
      setResultado(await accion());
      setConfirmandoEfectivo(false);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {puedeFacturar && (
          <button
            type="button"
            disabled={pendiente}
            onClick={() => ejecutar(() => (idFactura ? reenviarEnlace(idFactura) : facturarYEnviarEnlace(idOrden)))}
            className="btn btn-primary min-h-11 rounded-full px-5"
          >
            {pendiente ? <span className="loading loading-spinner loading-sm" /> : <FaWhatsapp aria-hidden className="size-4" />}
            {idFactura ? "Reenviar enlace de pago" : "Facturar y enviar enlace de pago"}
          </button>
        )}
        {idFactura && puedeRegistrarEfectivo && (
          <button type="button" disabled={pendiente} onClick={() => setConfirmandoEfectivo(true)} className="btn min-h-11 rounded-full px-5">
            <FaMoneyBillWave aria-hidden className="size-4" />
            Registrar pago en efectivo
          </button>
        )}
      </div>

      {confirmandoEfectivo && idFactura && (
        <ConfirmacionAccion
          titulo="¿El cliente pagó en caja?"
          mensaje="La factura quedará como pagada."
          textoConfirmar="Sí, registrar pago"
          tono="exito"
          pendiente={pendiente}
          onConfirmar={() => ejecutar(() => registrarPagoEfectivo(idFactura))}
          onCancelar={() => setConfirmandoEfectivo(false)}
        />
      )}

      {resultado && (
        <AvisoAccion exito={!resultado.error} origen={resultado}>
          {resultado.error ?? resultado.ok}
        </AvisoAccion>
      )}
    </div>
  );
}
