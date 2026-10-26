import { redirect } from "next/navigation";
import { esMecanico, RUTA_MIS_ORDENES, verificarEmpleado } from "@/features/auth/dal";

export const instant = false;

// El mecánico solo trabaja sus órdenes; el resto del panel lo devuelve a su pantalla.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await verificarEmpleado();
  if (esMecanico(usuario)) redirect(RUTA_MIS_ORDENES);

  return children;
}
