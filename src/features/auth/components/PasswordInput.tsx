"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

type Props = {
  id: string;
  name: string;
  autoComplete?: "current-password" | "new-password";
  value?: string;
  onChange?: (valor: string) => void;
};

export default function PasswordInput({ id, name, autoComplete = "current-password", value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? FaEyeSlash : FaEye;

  return (
    <label className="input w-full border-0 bg-base-200">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder="••••••••"
        autoComplete={autoComplete}
        value={value}
        onChange={onChange && ((e) => onChange(e.target.value))}
        required
        className="grow"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="cursor-pointer"
      >
        <Icon className="size-4" />
      </button>
    </label>
  );
}
