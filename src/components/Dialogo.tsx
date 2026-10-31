"use client";

import { useEffect, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const sinSuscripcion = () => () => {};

type Props = {
  titulo: string;
  mensaje?: React.ReactNode;
  icono?: React.ReactNode;
  bloqueado?: boolean;
  onCerrar: () => void;
  children: React.ReactNode;
};

export default function Dialogo({ titulo, mensaje, icono, bloqueado = false, onCerrar, children }: Props) {
  const id = useId();
  const enCliente = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  useEffect(() => {
    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !bloqueado) onCerrar();
    }
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [bloqueado, onCerrar]);

  if (!enCliente) return null;

  return createPortal(
    <div
      className="modal modal-open modal-bottom lg:modal-middle"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={mensaje ? `${id}-mensaje` : undefined}
    >
      <div className="modal-box flex flex-col gap-6 rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:max-w-md lg:rounded-3xl lg:p-7">
        <span aria-hidden className="mx-auto -mt-2 h-1.5 w-12 rounded-full bg-base-300 lg:hidden" />
        <div className="flex flex-col items-center gap-2 text-center">
          {icono}
          <h2 id={`${id}-titulo`} className="text-lg font-semibold text-secondary">
            {titulo}
          </h2>
          {mensaje && (
            <p id={`${id}-mensaje`} className="text-base-content/70">
              {mensaje}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">{children}</div>
      </div>
      <button type="button" onClick={onCerrar} disabled={bloqueado} aria-label="Cerrar" className="modal-backdrop" />
    </div>,
    document.body,
  );
}
