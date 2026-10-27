"use client";

import AvisoAccion from "@/components/AvisoAccion";
import Link from "next/link";
import { Suspense, useActionState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { login } from "../actions";
import GoogleButton from "./GoogleButton";
import OAuthError from "./OAuthError";
import PasswordInput from "./PasswordInput";

const labelClass = "mb-1.5 block text-sm font-semibold";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="card w-full max-w-xs border border-base-300 shadow-md">
      <div className="card-body gap-0 p-5">
        <h1 className="mb-6 text-center text-3xl font-bold text-secondary">Bienvenido</h1>

        <label htmlFor="correo" className={labelClass}>
          Usuario
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          placeholder="ingresar correo..."
          autoComplete="email"
          defaultValue={state?.correo}
          required
          className="input mb-5 w-full border-0 bg-base-200"
        />

        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <PasswordInput id="password" name="password" />

        <Link href="/recuperar" className="mt-2 self-end text-[11px] font-semibold hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>

        {state?.error && (
          <AvisoAccion origen={state}>
            {state.error}
          </AvisoAccion>
        )}
        <Suspense>
          <OAuthError />
        </Suspense>

        <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full rounded-full">
          {pending && <span className="loading loading-spinner loading-sm" />}
          Iniciar Sesión
        </button>
        <Link href="/registro" className="btn btn-outline btn-primary mt-4 w-full rounded-full font-medium">
          Registrarse
        </Link>

        <div className="divider my-4 text-xs text-base-content/60">o</div>
        <GoogleButton />

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <FaArrowLeft className="size-3" /> Volver Al Inicio
        </Link>
      </div>
    </form>
  );
}
