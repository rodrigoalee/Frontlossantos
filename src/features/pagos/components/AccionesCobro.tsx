"use client";

import { useState, useTransition } from "react";
import { FaMoneyBillWave, FaWhatsapp } from "react-icons/fa6";
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
        {idFactura && puedeRegistrarEfectivo && !confirmandoEfectivo && (
          <button type="button" disabled={pendiente} onClick={() => setConfirmandoEfectivo(true)} className="btn min-h-11 rounded-full px-5">
            <FaMoneyBillWave aria-hidden className="size-4" />
            Registrar pago en efectivo
          </button>
        )}
      </div>

      {confirmandoEfectivo && idFactura && (
        <div className="flex flex-col gap-3 rounded-2xl bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">¿Confirmas que el cliente pagó en caja? La factura quedará como pagada.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pendiente} onClick={() => ejecutar(() => registrarPagoEfectivo(idFactura))} className="btn btn-success btn-sm rounded-full px-5">
              {pendiente && <span className="loading loading-spinner loading-xs" />}
              Sí, registrar pago
            </button>
            <button type="button" disabled={pendiente} onClick={() => setConfirmandoEfectivo(false)} className="btn btn-sm rounded-full px-5">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <p
          role={resultado.error ? "alert" : "status"}
          className={`rounded-2xl px-4 py-3 text-sm ${resultado.error ? "bg-error/10 text-error" : "bg-emerald-50 text-emerald-800"}`}
        >
          {resultado.error ?? resultado.ok}
        </p>
      )}
    </div>
  );
}
