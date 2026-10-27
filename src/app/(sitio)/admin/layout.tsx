import PanelNavbar from "@/components/PanelNavbar";
import { rutaInicio, verificarEmpleado } from "@/features/auth/dal";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await verificarEmpleado();
  const permisos = usuario.permisos ?? [];
  const conAjustes =
    permisos.includes("usuarios.leer") || (permisos.includes("roles.leer") && permisos.includes("permisos.leer"));

  return (
    <>
      <PanelNavbar
        nombreCompleto={usuario.nombreCompleto}
        inicio={rutaInicio(usuario)}
        conPerfil={false}
        conAjustes={conAjustes}
      />
      {children}
    </>
  );
}
