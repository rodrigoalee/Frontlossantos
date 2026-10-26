"use client";

import PasswordInput from "@/features/auth/components/PasswordInput";

export default function CampoPassword({ valor, onChange }: { valor: string; onChange: (valor: string) => void }) {
  return (
    <div>
      <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
        Contraseña temporal
      </label>
      <PasswordInput id="password" name="password" autoComplete="new-password" value={valor} onChange={onChange} />
      <p className="mt-1.5 text-xs text-base-content/60">
        Mínimo 12 caracteres. Compártela por un medio privado; la persona la usará para iniciar sesión.
      </p>
    </div>
  );
}
