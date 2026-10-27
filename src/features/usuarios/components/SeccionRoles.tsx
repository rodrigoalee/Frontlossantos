import Link from "next/link";
import { redirect } from "next/navigation";
import { FaPen, FaPlus } from "react-icons/fa6";
import type { UsuarioSesion } from "@/features/auth/types";
import { ApiError } from "@/lib/api";
import { obtenerPermisos, obtenerPermisosDeRol, obtenerRolesDelPersonal, obtenerUsuarios } from "../dal";
import type { Permiso, Rol, UsuarioResumen } from "../types";
import EditorPermisos from "./EditorPermisos";
import { EliminarRolBoton, FormRol } from "./FormRol";

const RUTA_ROLES = "/admin/usuarios?tab=roles";

function rutaRol(idRol: number, editar = false) {
  return `${RUTA_ROLES}&rol=${idRol}${editar ? "&editar=1" : ""}`;
}

function ListaRoles({ roles, actual, puedeCrear }: { roles: Rol[]; actual?: number | "nuevo"; puedeCrear: boolean }) {
  const clase = (activo: boolean) =>
    `flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors lg:rounded-2xl ${
      activo ? "bg-secondary text-secondary-content" : "bg-base-200 text-secondary hover:bg-base-300"
    }`;

  return (
    <nav aria-label="Roles" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
      {roles.map((rol) => (
        <Link
          key={rol.idRol}
          href={rutaRol(rol.idRol)}
          scroll={false}
          aria-current={actual === rol.idRol ? "page" : undefined}
          className={clase(actual === rol.idRol)}
        >
          {rol.nombre}
        </Link>
      ))}
      {puedeCrear && (
        <Link
          href={`${RUTA_ROLES}&rol=nuevo`}
          scroll={false}
          className={`${clase(actual === "nuevo")} gap-2 border border-dashed border-base-300 bg-transparent`}
        >
          <FaPlus aria-hidden className="size-3" />
          Nuevo rol
        </Link>
      )}
    </nav>
  );
}

export default async function SeccionRoles({
  usuario,
  rolParam,
  editar,
}: {
  usuario: UsuarioSesion;
  rolParam?: string;
  editar: boolean;
}) {
  const permisos = new Set(usuario.permisos ?? []);

  let roles: Rol[];
  let catalogo: Permiso[];
  let usuarios: UsuarioResumen[];
  try {
    [roles, catalogo, usuarios] = await Promise.all([
      obtenerRolesDelPersonal(),
      obtenerPermisos(),
      permisos.has("usuarios.leer") ? obtenerUsuarios() : [],
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <p className="rounded-3xl border border-base-300 px-6 py-10 text-center text-sm text-base-content/70">
          Tu cuenta no tiene permiso para consultar roles y permisos.
        </p>
      );
    }
    throw error;
  }

  const nuevo = rolParam === "nuevo" && permisos.has("roles.crear");
  const rol = nuevo ? undefined : (roles.find((r) => String(r.idRol) === rolParam) ?? roles[0]);
  const asignados = rol ? await obtenerPermisosDeRol(rol.idRol) : [];
  const usuariosConRol = rol ? usuarios.filter((u) => u.rolId === rol.idRol).length : 0;
  const rolPropio = usuarios.find((u) => u.idUsuario === usuario.idUsuario)?.rolId;
  const esRolPropio = rol !== undefined && rol.idRol === rolPropio;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
      <ListaRoles roles={roles} actual={nuevo ? "nuevo" : rol?.idRol} puedeCrear={permisos.has("roles.crear")} />

      <section className="flex min-w-0 flex-col gap-6 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        {nuevo ? (
          <>
            <h2 className="text-xl font-bold text-secondary">Nuevo rol</h2>
            <p className="-mt-4 text-sm text-base-content/60">Después de crearlo, marca lo que puede hacer.</p>
            <FormRol rutaCancelar={RUTA_ROLES} />
          </>
        ) : !rol ? (
          <p className="text-sm text-base-content/60">Aún no hay roles del personal. Crea el primero.</p>
        ) : editar && permisos.has("roles.editar") ? (
          <>
            <h2 className="text-xl font-bold text-secondary">Editar rol</h2>
            <FormRol key={rol.idRol} rol={rol} rutaCancelar={rutaRol(rol.idRol)} />
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold break-words text-secondary">{rol.nombre}</h2>
                <p className="text-sm text-base-content/60">
                  {rol.descripcion || "Sin descripción"} · {usuariosConRol} {usuariosConRol === 1 ? "persona" : "personas"}
                </p>
              </div>
              {permisos.has("roles.editar") && (
                <Link href={rutaRol(rol.idRol, true)} scroll={false} className="btn btn-sm rounded-full px-4">
                  <FaPen aria-hidden className="size-3" />
                  Renombrar
                </Link>
              )}
            </div>

            {esRolPropio && (
              <p className="rounded-2xl bg-base-200 px-4 py-3 text-sm text-base-content/70">
                Es tu propio rol: puedes agregarle permisos, pero quitárselos debe hacerlo otro administrador.
              </p>
            )}

            <EditorPermisos
              key={rol.idRol}
              idRol={rol.idRol}
              permisos={catalogo}
              asignados={asignados.map((p) => p.idPermiso)}
              editable={permisos.has("roles.asignar_permisos")}
            />

            {permisos.has("roles.eliminar") && <EliminarRolBoton rol={rol} usuariosConRol={usuariosConRol} />}
          </>
        )}
      </section>
    </div>
  );
}
