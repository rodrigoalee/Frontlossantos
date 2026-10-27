import Link from "next/link";
import { redirect } from "next/navigation";
import { FaPlus } from "react-icons/fa6";
import type { UsuarioSesion } from "@/features/auth/types";
import { ApiError } from "@/lib/api";
import { obtenerRolesDelPersonal, obtenerSedes, obtenerUsuarios, permisosDeCadaRol } from "../dal";
import type { Rol, Sucursal, UsuarioResumen } from "../types";
import GestionUsuarioModal from "./GestionUsuarioModal";
import TablaUsuarios from "./TablaUsuarios";

export default async function SeccionUsuarios({ usuario, gestionar }: { usuario: UsuarioSesion; gestionar?: number }) {
  const permisos = new Set(usuario.permisos ?? []);

  let usuarios: UsuarioResumen[];
  let roles: Rol[];
  let sedes: Sucursal[];
  try {
    [usuarios, roles, sedes] = await Promise.all([
      obtenerUsuarios(),
      permisos.has("roles.leer") ? obtenerRolesDelPersonal() : [],
      obtenerSedes(),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  const seleccionado = gestionar ? usuarios.find((u) => u.idUsuario === gestionar) : undefined;
  const permisosPorRol = seleccionado ? await permisosDeCadaRol(roles) : {};

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">Personal del taller</h2>
          <p className="text-sm text-base-content/60">Toca “Gestionar” para editar, cambiar la contraseña o el acceso.</p>
        </div>
        {permisos.has("usuarios.crear") && (
          <Link href="/admin/ajustes/nuevo" className="btn btn-primary min-h-11 rounded-full px-6">
            <FaPlus aria-hidden className="size-3" />
            Nuevo usuario
          </Link>
        )}
      </div>

      <TablaUsuarios usuarios={usuarios} />

      {seleccionado && (
        <GestionUsuarioModal
          key={seleccionado.idUsuario}
          usuario={seleccionado}
          roles={roles}
          sedes={sedes}
          permisosPorRol={permisosPorRol}
          esPropio={seleccionado.idUsuario === usuario.idUsuario}
          puedeEditar={permisos.has("usuarios.editar")}
          puedeCambiarEstado={permisos.has("usuarios.cambiar_estado")}
        />
      )}
    </>
  );
}
