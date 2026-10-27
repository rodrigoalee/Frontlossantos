import type { IconType } from "react-icons";
import {
  FaBoxesStacked,
  FaCalendarDays,
  FaChartLine,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaScrewdriverWrench,
  FaUser,
  FaUserShield,
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
    titulo: "Clientes y vehículos",
    descripcion: "Registra a cada cliente con sus datos de contacto y sus vehículos. Encuéntralo por nombre, correo o placa con los filtros de la tabla.",
    permiso: "clientes.leer",
    Icono: FaUser,
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
  {
    slug: "facturacion",
    titulo: "Facturación y pagos",
    descripcion: "Consulta las facturas emitidas, su estado y cómo se pagaron; reenvía el enlace de pago o registra el efectivo.",
    permiso: "facturas.leer",
    Icono: FaFileInvoiceDollar,
  },
  {
    slug: "analiticas",
    titulo: "Analíticas",
    descripcion: "Ingresos, órdenes, servicios más vendidos y desempeño del taller en un tablero de Power BI.",
    permiso: "analiticas.ver",
    Icono: FaChartLine,
  },
  {
    slug: "usuarios",
    titulo: "Usuarios y accesos",
    descripcion: "Crea las cuentas del personal, asígnales rol y sede, y decide qué puede hacer cada rol.",
    permiso: "usuarios.leer",
    Icono: FaUserShield,
  },
];

export function modulosPermitidos(permisos: string[] | null | undefined) {
  const propios = new Set(permisos ?? []);
  return MODULOS.filter((modulo) => propios.has(modulo.permiso));
}
