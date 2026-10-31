"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";
import { FaCircleQuestion } from "react-icons/fa6";

export type NombreRecorrido = "panel" | "perfil" | "vehiculo" | "agendar";

// Pasos generales por vista: orientan sin ir campo por campo, para no hacer esperar al cliente.
const RECORRIDOS: Record<NombreRecorrido, DriveStep[]> = {
  panel: [
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
  ],
  perfil: [
    {
      element: '[data-recorrido="mis-datos"]',
      popover: {
        title: "Tus datos",
        description: "Revisa que tu teléfono y correo estén bien; ahí te llegan los avisos de tu vehículo.",
      },
    },
    {
      element: '[data-recorrido="registrar-vehiculo"]',
      popover: {
        title: "Registra tu vehículo",
        description: "Agrega tu carro con placa, marca, modelo y año. Lo necesitas para poder agendar una cita.",
      },
    },
  ],
  vehiculo: [
    {
      element: '[data-recorrido="agendar-tras-vehiculo"]',
      popover: {
        title: "¡Listo!",
        description: "Tu vehículo ya está registrado. Ahora agenda tu primera cita.",
      },
    },
  ],
  agendar: [
    {
      element: '[data-recorrido="datos-cita"]',
      popover: {
        title: "Datos de la cita",
        description:
          "Elige tu vehículo, la sede y el servicio. Si lo que necesitas no está en la lista, elige “Otro” y te enviamos una cotización.",
      },
    },
    {
      element: '[data-recorrido="fecha-cita"]',
      popover: {
        title: "Fecha y hora",
        description: "Primero elige la sede para ver los horarios libres.",
      },
    },
    {
      element: '[data-recorrido="continuar-cita"]',
      popover: {
        title: "Revisa y confirma",
        description: "Revisa el resumen y confirma. El taller te avisará por mensaje y correo.",
      },
    },
  ],
};

/** Omite los pasos cuyo elemento no está en pantalla, como la tarjeta de cita cuando el cliente aún no tiene ninguna. */
function iniciarRecorrido(nombre: NombreRecorrido) {
  const pasos = RECORRIDOS[nombre].filter(
    (paso) => typeof paso.element !== "string" || document.querySelector(paso.element),
  );
  if (pasos.length === 0) return;

  driver({
    showProgress: pasos.length > 1,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    doneBtnText: "Listo",
    popoverClass: "recorrido-lossantos",
    // Un clic fuera del cuadro no cierra el recorrido ni activa lo resaltado; se sale con la X, Esc o "Listo".
    overlayClickBehavior: "none",
    disableActiveInteraction: true,
    steps: pasos,
  }).drive();
}

/**
 * Lanza el recorrido la primera vez que el cliente llega a la vista. Debe montarse cuando los elementos que
 * resalta ya están en pantalla (por ejemplo, dentro del mismo Suspense que la lista de citas).
 */
export function RecorridoPrimeraVez({ nombre }: { nombre: NombreRecorrido }) {
  useEffect(() => {
    const clave = `recorrido-${nombre}-visto`;
    try {
      if (localStorage.getItem(clave)) return;
    } catch {
      return;
    }

    // La marca se guarda al arrancar y no al montar: en desarrollo React monta dos veces y el recorrido no saldría nunca.
    const espera = setTimeout(() => {
      try {
        localStorage.setItem(clave, "1");
      } catch {}
      iniciarRecorrido(nombre);
    }, 400);
    return () => clearTimeout(espera);
  }, [nombre]);

  return null;
}

export default function BotonRecorrido({ nombre }: { nombre: NombreRecorrido }) {
  return (
    <button
      type="button"
      data-recorrido="ayuda"
      onClick={() => iniciarRecorrido(nombre)}
      className="btn btn-ghost rounded-full px-4 text-secondary"
    >
      <FaCircleQuestion aria-hidden className="size-4" />
      Ver recorrido
    </button>
  );
}
