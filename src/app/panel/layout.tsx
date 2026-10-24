import PanelNavbar from "@/components/PanelNavbar";
import { verificarPerfilCompleto } from "@/features/auth/dal";

export const instant = false;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await verificarPerfilCompleto();
  return (
    <>
      <PanelNavbar usuario={usuario} />
      {children}
    </>
  );
}
