import type { IconType } from "react-icons";
import {
  FaBoxesStacked,
  FaCalendarDays,
  FaCarSide,
  FaClipboardList,
  FaScrewdriverWrench,
  FaUser,
} from "react-icons/fa6";

export type Modulo = {
  slug: string;
  titulo: string;
  descripcion: string;
  permiso: string;
  Icono: IconType;
};

export const MODULOS: Modulo[] = [
  {
    slug: "clientes",
    titulo: "Clientes",
    descripcion: "Registra y consulta los datos de contacto de cada cliente, con sus vehículos y su historial en el taller.",
    permiso: "clientes.leer",
    Icono: FaUser,
  },
  {
    slug: "vehiculos",
    titulo: "Vehículos",
    descripcion: "Da de alta los vehículos que atiende el taller y vincúlalos con su dueño por placa.",
    permiso: "vehiculos.leer",
    Icono: FaCarSide,
  },
  {
    slug: "citas",
    titulo: "Citas",
    descripcion: "Revisa la agenda de cada sede, confirma o cancela citas y registra las que llegan por teléfono.",
    permiso: "citas.leer",
    Icono: FaCalendarDays,
  },
  {
    slug: "ordenes",
    titulo: "Órdenes de trabajo",
    descripcion: "Abre la orden al recibir un vehículo, asigna al mecánico y sigue el trabajo hasta entregarlo.",
    permiso: "ordenes.leer",
    Icono: FaClipboardList,
  },
  {
    slug: "repuestos",
    titulo: "Repuestos",
    descripcion: "Administra el catálogo de repuestos, sus precios y las existencias de cada sede.",
    permiso: "repuestos.leer",
    Icono: FaBoxesStacked,
  },
  {
    slug: "servicios",
    titulo: "Servicios",
    descripcion: "Mantén al día los servicios que ofrece el taller y la tarifa de mano de obra de cada uno.",
    permiso: "servicios.leer",
    Icono: FaScrewdriverWrench,
  },
];

export function modulosPermitidos(permisos: string[] | null | undefined) {
  const propios = new Set(permisos ?? []);
  return MODULOS.filter((modulo) => propios.has(modulo.permiso));
}
