"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";
import { FaCircleQuestion } from "react-icons/fa6";

const CLAVE_VISTO = "recorrido-panel-visto";

const PASOS: DriveStep[] = [
  {
    popover: {
      title: "¡Bienvenido a tu panel!",
      description: "Te mostramos en un momento todo lo que puedes hacer desde aquí.",
    },
  },
  {
    element: '[data-recorrido="citas"]',
    popover: {
      title: "Tus citas",
      description:
        "Aquí aparecen tus visitas al taller con su fecha, vehículo y estado. Te avisaremos por mensaje y correo cada vez que avancen.",
    },
  },
  {
    element: '[data-recorrido="cita"]',
    popover: {
      title: "Seguimiento de tu vehículo",
      description:
        "Toca una cita para ver el avance del trabajo, revisar y aceptar cotizaciones, o cancelarla si lo necesitas.",
    },
  },
  {
    element: '[data-recorrido="agendar"]',
    popover: {
      title: "Agendar una cita",
      description:
        "Reserva tu próxima visita en pocos pasos. Si el trabajo no está en el catálogo, te enviamos una cotización antes de confirmarla.",
    },
  },
  {
    element: '[data-recorrido="opciones"]',
    popover: {
      title: "Tu cuenta",
      description: "Desde aquí entras a Mi perfil, revisas y pagas tus facturas en Mis facturas, o cierras sesión.",
    },
  },
  {
    element: '[data-recorrido="ayuda"]',
    popover: {
      title: "¿Lo quieres ver otra vez?",
      description: "Toca este botón cuando quieras repetir el recorrido.",
    },
  },
];

/** Omite los pasos cuyo elemento no está en pantalla, como la tarjeta de cita cuando el cliente aún no tiene ninguna. */
function iniciarRecorrido() {
  driver({
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    doneBtnText: "Listo",
    popoverClass: "recorrido-lossantos",
    // Un clic fuera del cuadro no cierra el recorrido ni activa lo resaltado; se sale con la X, Esc o "Listo".
    overlayClickBehavior: "none",
    disableActiveInteraction: true,
    steps: PASOS.filter((paso) => typeof paso.element !== "string" || document.querySelector(paso.element)),
  }).drive();
}

/**
 * Lanza el recorrido la primera vez que el cliente entra a su panel. Va dentro del mismo Suspense que la lista
 * de citas para montarse cuando las tarjetas ya están en pantalla.
 */
export function RecorridoPrimeraVez() {
  useEffect(() => {
    try {
      if (localStorage.getItem(CLAVE_VISTO)) return;
    } catch {
      return;
    }

    // La marca se guarda al arrancar y no al montar: en desarrollo React monta dos veces y el recorrido no saldría nunca.
    const espera = setTimeout(() => {
      try {
        localStorage.setItem(CLAVE_VISTO, "1");
      } catch {}
      iniciarRecorrido();
    }, 400);
    return () => clearTimeout(espera);
  }, []);

  return null;
}

export default function BotonRecorrido() {
  return (
    <button
      type="button"
      data-recorrido="ayuda"
      onClick={iniciarRecorrido}
      className="btn btn-ghost rounded-full px-4 text-secondary"
    >
      <FaCircleQuestion aria-hidden className="size-4" />
      Ver recorrido
    </button>
  );
}
