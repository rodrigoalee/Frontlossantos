import AvisoAccion from "@/components/AvisoAccion";
export const CLASE_CAMPO = "w-full border-0 bg-base-200";

export function Campo({ id, etiqueta, ayuda, children }: { id: string; etiqueta: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {etiqueta}
      </label>
      {children}
      {ayuda && <p className="mt-1.5 text-xs text-base-content/60">{ayuda}</p>}
    </div>
  );
}

export function MensajeError({ error }: { error?: string }) {
  if (!error) return null;
  return (
<AvisoAccion>{error}</AvisoAccion>
  );
}
