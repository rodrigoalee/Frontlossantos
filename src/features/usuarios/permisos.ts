import type { Permiso } from "./types";

export const ROL_CLIENTE = "Cliente";

// Un rol con este permiso trabaja en todas las sedes, así que su usuario no necesita sede propia.
export const PERMISO_SUCURSALES_TODAS = "sucursales.todas";

const NOMBRE_MODULO: Record<string, string> = {
  Ordenes: "Órdenes de trabajo",
  Vehiculos: "Vehículos",
  Facturas: "Facturación",
  Analiticas: "Analíticas",
};

const ETIQUETA_ACCION: Record<string, string> = {
  leer: "Ver",
  ver: "Ver",
  crear: "Crear",
  editar: "Editar",
  eliminar: "Eliminar",
  baja: "Dar de baja",
  cambiar_estado: "Cambiar estado",
  trabajar: "Trabajar las asignadas",
  asignar_roles: "Asignar roles",
  asignar_permisos: "Asignar permisos",
  gestionar: "Administrar",
  todas: "Ver todas las sedes",
  ajustar: "Ajustar existencias",
  cobrar: "Cobrar con tarjeta",
  crear_sesion: "Crear enlace de pago",
  registrar_pago_manual: "Registrar pago manual",
};

export function nombreModulo(modulo: string) {
  return NOMBRE_MODULO[modulo] ?? modulo;
}

export function etiquetaPermiso(permiso: Permiso) {
  const accion = permiso.nombreCodigo.split(".")[1] ?? permiso.nombreCodigo;
  return ETIQUETA_ACCION[accion] ?? permiso.descripcion ?? permiso.nombreCodigo;
}

export function agruparPorModulo(permisos: Permiso[]) {
  const grupos = Map.groupBy(permisos, (permiso) => permiso.modulo);
  return [...grupos]
    .map(([modulo, lista]) => ({ modulo, nombre: nombreModulo(modulo), permisos: lista }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
