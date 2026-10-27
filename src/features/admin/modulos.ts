import type { IconType } from "react-icons";
import {
  FaBoxesStacked,
  FaCalendarDays,
  FaChartLine,
  FaClipboardList,
  FaFileExport,
  FaFileInvoiceDollar,
  FaScrewdriverWrench,
  FaUser,
} from "react-icons/fa6";

export type Modulo = {
  slug: string;
  titulo: string;
  permiso: string;
  Icono: IconType;
};

export const MODULOS: Modulo[] = [
  {
    slug: "clientes",
    titulo: "Clientes y vehículos",
    permiso: "clientes.leer",
    Icono: FaUser,
  },
  {
    slug: "citas",
    titulo: "Citas",
    permiso: "citas.leer",
    Icono: FaCalendarDays,
  },
  {
    slug: "ordenes",
    titulo: "Órdenes de trabajo",
    permiso: "ordenes.leer",
    Icono: FaClipboardList,
  },
  {
    slug: "repuestos",
    titulo: "Repuestos",
    permiso: "repuestos.leer",
    Icono: FaBoxesStacked,
  },
  {
    slug: "servicios",
    titulo: "Servicios",
    permiso: "servicios.leer",
    Icono: FaScrewdriverWrench,
  },
  {
    slug: "facturacion",
    titulo: "Facturación y pagos",
    permiso: "facturas.leer",
    Icono: FaFileInvoiceDollar,
  },
  {
    slug: "reportes",
    titulo: "Reportes",
    permiso: "reportes.ver",
    Icono: FaFileExport,
  },
  {
    slug: "analiticas",
    titulo: "Analíticas",
    permiso: "analiticas.ver",
    Icono: FaChartLine,
  },
];

export function modulosPermitidos(permisos: string[] | null | undefined) {
  const propios = new Set(permisos ?? []);
  return MODULOS.filter((modulo) => propios.has(modulo.permiso));
}
