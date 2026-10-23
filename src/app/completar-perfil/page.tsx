import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { cerrarSesion } from "@/features/auth/actions";
import CompletarPerfilForm from "@/features/auth/components/CompletarPerfilForm";
import { verificarSesion } from "@/features/auth/dal";
import { RUTA_DESPUES_DE_LOGIN } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Completa tu perfil | Los Santos Customs",
};

/** Bloquea en el servidor hasta verificar la sesión, igual que /panel. */
export const instant = false;

/**
 * Gate de las cuentas creadas con Google: piden el teléfono antes de entrar al portal.
 * Fuera de /panel a propósito, o el layout del portal la redirigiría a sí misma.
 */
export default async function CompletarPerfilPage() {
  const usuario = await verificarSesion();
  if (usuario.perfilCompleto) redirect(RUTA_DESPUES_DE_LOGIN);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
        <Logo />
        <div className="card w-full max-w-xs border border-base-300 shadow-md">
          <div className="card-body gap-0 p-5">
            <h1 className="mb-2 text-center text-3xl font-bold text-secondary">Un paso más</h1>
            <p className="mb-6 text-center text-sm text-base-content/70">
              Necesitamos tu teléfono para avisarte por WhatsApp del estado de tu vehículo.
            </p>

            <CompletarPerfilForm />

            {/* Salida obligatoria: si el taller ya tiene una ficha con este correo, el formulario nunca podrá guardarse. */}
            <form action={cerrarSesion} className="mt-6 text-center">
              <button type="submit" className="text-xs font-medium text-primary hover:underline">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
