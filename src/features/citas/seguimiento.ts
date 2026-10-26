import { formatearFechaCita } from "./formato";
import type { SeguimientoCita } from "./types";

export type EstadoHito = "completado" | "actual" | "pendiente";

export type Hito = {
  titulo: string;
  descripcion: string;
  fecha: string | null;
  estado: EstadoHito;
};

export function esCancelada(seguimiento: SeguimientoCita) {
  return seguimiento.estado === "Cancelada" && seguimiento.estadoOrden === null;
}

function nivelAlcanzado(seguimiento: SeguimientoCita) {
  if (seguimiento.pagado) return 5;
  if (seguimiento.estadoOrden === "Finalizado") return 4;
  if (seguimiento.estadoOrden === "EnProceso") return 3;
  if (seguimiento.estadoOrden === "EnRecepcion") return 2;
  if (seguimiento.estado === "Confirmada") return 1;
  return 0;
}

export function construirHitos(seguimiento: SeguimientoCita): Hito[] {
  const nivel = nivelAlcanzado(seguimiento);
  const fecha = (valor: string | null) => (valor ? formatearFechaCita(valor) : null);

  const hitos = [
    {
      titulo: "Cita agendada",
      descripcion: "Recibimos tu solicitud de visita.",
      fecha: fecha(seguimiento.fechaHora),
    },
    {
      titulo: "Confirmada por el taller",
      descripcion: "El taller revisó y confirmó tu cita.",
      fecha: null,
    },
    {
      titulo: "Vehículo recibido",
      descripcion: "Tu vehículo ingresó al taller y está en revisión.",
      fecha: fecha(seguimiento.fechaIngreso),
    },
    {
      titulo: "En proceso",
      descripcion: "Nuestros mecánicos están trabajando en tu vehículo.",
      fecha: null,
    },
    {
      titulo: "Trabajo terminado",
      descripcion: "El servicio está listo. Ya puedes pasar por tu vehículo.",
      fecha: fecha(seguimiento.fechaFinalizacion),
    },
    {
      titulo: "Pago completado",
      descripcion: "Registramos tu pago. ¡Gracias por confiar en nosotros!",
      fecha: null,
    },
  ];

  if (esCancelada(seguimiento)) {
    return hitos.map((hito, i) => ({ ...hito, estado: i === 0 ? "completado" : "pendiente" }));
  }

  return hitos.map((hito, i) => ({
    ...hito,
    estado: i < nivel || (i === nivel && i === hitos.length - 1) ? "completado" : i === nivel ? "actual" : "pendiente",
  }));
}
