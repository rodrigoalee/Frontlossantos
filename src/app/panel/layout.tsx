import { verificarPerfilCompleto } from "@/features/auth/dal";

/**
 * El portal bloquea en el servidor hasta verificar la sesión: así la redirección a
 * /login o /completar-perfil es un 307 real y no llega a pintarse nada antes.
 */
export const instant = false;

/** Portal del cliente: requiere sesión y perfil completo. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await verificarPerfilCompleto();
  return children;
}
