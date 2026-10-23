import type { Metadata } from "next";
import { verificarPerfilCompleto } from "@/features/auth/dal";

export const metadata: Metadata = {
  title: "Panel | Los Santos Customs",
};

/** Destino después de iniciar sesión. Por ahora está vacío a propósito. */
export default async function PanelPage() {
  await verificarPerfilCompleto();
  return null;
}
