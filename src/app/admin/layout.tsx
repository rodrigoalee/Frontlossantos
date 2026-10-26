import PanelNavbar from "@/components/PanelNavbar";
import { RUTA_ADMIN, verificarEmpleado } from "@/features/auth/dal";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await verificarEmpleado();

  return (
    <>
      <PanelNavbar nombreCompleto={usuario.nombreCompleto} inicio={RUTA_ADMIN} conPerfil={false} />
      {children}
    </>
  );
}
