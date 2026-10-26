type Props = {
  valores?: Record<string, string>;
  compacto?: boolean;
};

export default function CamposServicio({ valores, compacto = false }: Props) {
  const entrada = `input w-full border-0 bg-base-200 ${compacto ? "input-sm" : ""}`;
  const etiqueta = compacto ? "mb-1 block text-sm font-semibold text-base-content/50" : "mb-1.5 block text-sm font-semibold";

  return (
    <>
      <div>
        <label htmlFor="nombre" className={etiqueta}>
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          maxLength={100}
          required
          autoComplete="off"
          defaultValue={valores?.nombre}
          className={entrada}
        />
        <p className="mt-1.5 text-xs text-base-content/60">Así lo verán los clientes al agendar su cita.</p>
      </div>
      <div>
        <label htmlFor="tarifaManoObra" className={etiqueta}>
          Tarifa de mano de obra (Q)
        </label>
        <input
          id="tarifaManoObra"
          name="tarifaManoObra"
          type="number"
          inputMode="decimal"
          min={0}
          max={9_999_999.99}
          step={0.01}
          required
          defaultValue={valores?.tarifaManoObra}
          className={entrada}
        />
        <p className="mt-1.5 text-xs text-base-content/60">Con IVA incluido. Los repuestos se cobran aparte.</p>
      </div>
    </>
  );
}
