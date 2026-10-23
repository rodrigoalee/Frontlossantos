"use client";

import { useSearchParams } from "next/navigation";

const MENSAJES: Record<string, string> = {
  google: "No se pudo iniciar sesión con Google. Intenta de nuevo.",
  empleado: "Esta cuenta inicia sesión con su correo y contraseña.",
  taller: "Ese correo ya está registrado en el taller. Comunícate con nosotros para activar tu acceso.",
};

export default function OAuthError() {
  const error = useSearchParams().get("error");
  const mensaje = error ? MENSAJES[error] : undefined;
  if (!mensaje) return null;

  return (
    <p role="alert" className="mt-3 text-center text-sm text-error">
      {mensaje}
    </p>
  );
}
