import { verificarPerfilCompleto } from "@/features/auth/dal";

export const instant = false;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await verificarPerfilCompleto();
  return children;
}
