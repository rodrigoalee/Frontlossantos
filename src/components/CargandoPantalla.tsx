export default function CargandoPantalla({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid animate-aparecer place-items-center bg-neutral/60 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-3 text-neutral-content">
        <span className="loading loading-spinner loading-lg text-primary" aria-hidden />
        <p className="text-sm font-medium">{texto}</p>
      </div>
    </div>
  );
}
