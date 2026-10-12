"use client";

import { useSearchParams } from "next/navigation";

/** Muestra el error cuando el callback de Google redirige a /login?error=google. */
export default function OAuthError() {
  const error = useSearchParams().get("error");
  if (error !== "google") return null;

  return (
    <p role="alert" className="mt-3 text-center text-sm text-error">
      No se pudo iniciar sesión con Google. Intenta de nuevo.
    </p>
  );
}
