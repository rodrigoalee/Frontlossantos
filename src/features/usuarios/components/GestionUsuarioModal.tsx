"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { FaXmark } from "react-icons/fa6";
import { actualizarUsuario, cambiarEstadoUsuario, restablecerPassword } from "../actions";
import type { Permiso, Rol, Sucursal, UsuarioResumen } from "../types";
import CampoPassword from "./CampoPassword";
import CamposRolSede, { CLASE_CAMPO } from "./CamposRolSede";

const RUTA_LISTA = "/admin/usuarios";

type Seccion = "datos" | "password" | "acceso";
type Mensaje = { tipo: "ok" | "error"; texto: string } | undefined;

type Props = {
  usuario: UsuarioResumen;
  roles: Rol[];
  sedes: Sucursal[];
  permisosPorRol: Record<number, Permiso[]>;
  esPropio: boolean;
  puedeEditar: boolean;
  puedeCambiarEstado: boolean;
};

function Aviso({ mensaje }: { mensaje: Mensaje }) {
  if (!mensaje) return null;
  return (
    <p
      role={mensaje.tipo === "error" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm ${mensaje.tipo === "error" ? "bg-error/10 text-error" : "bg-emerald-50 text-emerald-800"}`}
    >
      {mensaje.texto}
    </p>
  );
}

function FormDatos({ usuario, roles, sedes, permisosPorRol, esPropio }: Omit<Props, "puedeEditar" | "puedeCambiarEstado">) {
  const [nombreCompleto, setNombreCompleto] = useState(usuario.nombreCompleto);
  const [correo, setCorreo] = useState(usuario.correo);
  const [rolId, setRolId] = useState(usuario.rolId ? String(usuario.rolId) : "");
  const [sucursalId, setSucursalId] = useState(usuario.sucursalId ? String(usuario.sucursalId) : "");
  const [mensaje, setMensaje] = useState<Mensaje>();
  const [pendiente, startTransition] = useTransition();

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    startTransition(async () => {
      const resultado = await actualizarUsuario(usuario.idUsuario, {
        nombreCompleto,
        correo,
        rolId: Number(rolId),
        sucursalId: sucursalId ? Number(sucursalId) : null,
      });
      setMensaje(resultado?.error ? { tipo: "error", texto: resultado.error } : { tipo: "ok", texto: "Cambios guardados." });
    });
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      <div>
        <label htmlFor="editar-nombre" className="mb-1.5 block text-sm font-semibold">
          Nombre completo
        </label>
        <input
          id="editar-nombre"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          maxLength={150}
          required
          className={`input ${CLASE_CAMPO}`}
        />
      </div>
      <div>
        <label htmlFor="editar-correo" className="mb-1.5 block text-sm font-semibold">
          Correo
        </label>
        <input
          id="editar-correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          maxLength={100}
          required
          className={`input ${CLASE_CAMPO}`}
        />
      </div>
      <CamposRolSede
        roles={roles}
        sedes={sedes}
        permisosPorRol={permisosPorRol}
        rolId={rolId}
        sucursalId={sucursalId}
        onRol={setRolId}
        onSede={setSucursalId}
        rolBloqueado={esPropio}
      />
      <Aviso mensaje={mensaje} />
      <button type="submit" disabled={pendiente} className="btn btn-primary self-end rounded-full px-8">
        {pendiente && <span className="loading loading-spinner loading-sm" />}
        Guardar cambios
      </button>
    </form>
  );
}

function FormPassword({ usuario }: { usuario: UsuarioResumen }) {
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState<Mensaje>();
  const [pendiente, startTransition] = useTransition();

  function restablecer(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    startTransition(async () => {
      const resultado = await restablecerPassword(usuario.idUsuario, password);
      setMensaje(
        resultado?.error
          ? { tipo: "error", texto: resultado.error }
          : {
              tipo: "ok",
              texto: `Listo. Comparte la nueva contraseña con ${usuario.nombreCompleto}; sus sesiones abiertas se cerraron.`,
            },
      );
    });
  }

  return (
    <form onSubmit={restablecer} className="flex flex-col gap-5">
      <CampoPassword valor={password} onChange={setPassword} />
      <Aviso mensaje={mensaje} />
      <button type="submit" disabled={pendiente} className="btn btn-primary self-end rounded-full px-8">
        {pendiente && <span className="loading loading-spinner loading-sm" />}
        Restablecer contraseña
      </button>
    </form>
  );
}

function SeccionAcceso({ usuario, esPropio }: { usuario: UsuarioResumen; esPropio: boolean }) {
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje>();
  const [pendiente, startTransition] = useTransition();

  function cambiar(activo: boolean) {
    startTransition(async () => {
      const resultado = await cambiarEstadoUsuario(usuario.idUsuario, activo);
      setConfirmando(false);
      setMensaje(resultado?.error ? { tipo: "error", texto: resultado.error } : undefined);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base-content/80">
        {usuario.activo
          ? "La cuenta está activa: puede iniciar sesión y trabajar con los permisos de su rol."
          : "La cuenta está desactivada: no puede iniciar sesión. Sus datos y su historial se conservan."}
      </p>

      {esPropio ? (
        <p className="rounded-2xl bg-base-200 px-4 py-3 text-sm text-base-content/70">No puedes desactivar tu propia cuenta.</p>
      ) : usuario.activo ? (
        confirmando ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-error/10 p-4">
            <p className="text-sm text-error">
              {usuario.nombreCompleto} perderá el acceso de inmediato, incluso si tiene una sesión abierta.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => cambiar(false)} disabled={pendiente} className="btn btn-error rounded-full px-6">
                {pendiente && <span className="loading loading-spinner loading-sm" />}
                Sí, desactivar
              </button>
              <button type="button" onClick={() => setConfirmando(false)} disabled={pendiente} className="btn rounded-full px-6">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmando(true)} className="btn btn-outline btn-error self-start rounded-full px-6">
            Desactivar cuenta
          </button>
        )
      ) : (
        <button type="button" onClick={() => cambiar(true)} disabled={pendiente} className="btn btn-primary self-start rounded-full px-6">
          {pendiente && <span className="loading loading-spinner loading-sm" />}
          Activar cuenta
        </button>
      )}

      <Aviso mensaje={mensaje} />
    </div>
  );
}

export default function GestionUsuarioModal(props: Props) {
  const { usuario, esPropio, puedeEditar, puedeCambiarEstado } = props;
  const router = useRouter();
  const secciones = [
    ...(puedeEditar ? [{ valor: "datos", etiqueta: "Datos" }, { valor: "password", etiqueta: "Contraseña" }] : []),
    ...(puedeCambiarEstado ? [{ valor: "acceso", etiqueta: "Acceso" }] : []),
  ] as { valor: Seccion; etiqueta: string }[];
  const [seccion, setSeccion] = useState<Seccion | undefined>(secciones[0]?.valor);

  useEffect(() => {
    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") router.push(RUTA_LISTA, { scroll: false });
    }
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [router]);

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true" aria-labelledby="titulo-gestion">
      <div className="modal-box flex max-h-[90dvh] flex-col gap-5 rounded-t-3xl p-5 sm:max-w-xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="titulo-gestion" className="text-xl font-bold break-words text-secondary">
              {usuario.nombreCompleto}
            </h2>
            <p className="text-sm break-words text-base-content/60">
              {usuario.correo}
              {esPropio && " · Tu cuenta"}
            </p>
          </div>
          <Link href={RUTA_LISTA} scroll={false} aria-label="Cerrar" className="btn btn-circle btn-ghost btn-sm shrink-0">
            <FaXmark aria-hidden className="size-4" />
          </Link>
        </div>

        {secciones.length === 0 ? (
          <p className="text-sm text-base-content/70">Tu cuenta no tiene permiso para modificar usuarios.</p>
        ) : (
          <>
            <div role="tablist" className="tabs tabs-box w-full rounded-full">
              {secciones.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  role="tab"
                  aria-selected={seccion === opcion.valor}
                  onClick={() => setSeccion(opcion.valor)}
                  className={`tab grow rounded-full ${seccion === opcion.valor ? "tab-active" : ""}`}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto">
              {seccion === "datos" && <FormDatos {...props} />}
              {seccion === "password" && <FormPassword usuario={usuario} />}
              {seccion === "acceso" && <SeccionAcceso usuario={usuario} esPropio={esPropio} />}
            </div>
          </>
        )}
      </div>
      <Link href={RUTA_LISTA} scroll={false} className="modal-backdrop" aria-hidden tabIndex={-1}>
        Cerrar
      </Link>
    </div>
  );
}
