type Props = {
  valores?: Record<string, string>;
  compacto?: boolean;
};

const CAMPOS = [
  {
    name: "codigoStock",
    label: "Código",
    type: "text",
    maxLength: 50,
    ayuda: "Único en el catálogo, por ejemplo FIL-ACE-001.",
    className: "uppercase",
  },
  { name: "nombre", label: "Nombre", type: "text", maxLength: 100 },
] as const;

export default function CamposRepuesto({ valores, compacto = false }: Props) {
  const entrada = `input w-full border-0 bg-base-200 ${compacto ? "input-sm" : ""}`;
  const etiqueta = compacto ? "mb-1 block text-sm font-semibold text-base-content/50" : "mb-1.5 block text-sm font-semibold";

  return (
    <>
      {CAMPOS.map((campo) => (
        <div key={campo.name}>
          <label htmlFor={campo.name} className={etiqueta}>
            {campo.label}
          </label>
          <input
            id={campo.name}
            name={campo.name}
            type={campo.type}
            maxLength={campo.maxLength}
            required
            autoComplete="off"
            defaultValue={valores?.[campo.name]}
            className={`${entrada} ${"className" in campo ? campo.className : ""}`}
          />
          {"ayuda" in campo && <p className="mt-1.5 text-xs text-base-content/60">{campo.ayuda}</p>}
        </div>
      ))}
      <div>
        <label htmlFor="precioUnitario" className={etiqueta}>
          Precio unitario (Q)
        </label>
        <input
          id="precioUnitario"
          name="precioUnitario"
          type="number"
          inputMode="decimal"
          min={0}
          max={9_999_999.99}
          step={0.01}
          required
          defaultValue={valores?.precioUnitario}
          className={entrada}
        />
        <p className="mt-1.5 text-xs text-base-content/60">Precio de venta con IVA incluido.</p>
      </div>
    </>
  );
}
