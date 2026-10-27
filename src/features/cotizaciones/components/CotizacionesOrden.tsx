import { obtenerCotizacionesDeOrden } from "../dal";
import NuevaCotizacionForm from "./NuevaCotizacionForm";
import TarjetaCotizacion from "./TarjetaCotizacion";

export default async function CotizacionesOrden({ idOrden, puedeCotizar }: { idOrden: number; puedeCotizar: boolean }) {
  const cotizaciones = await obtenerCotizacionesDeOrden(idOrden).catch(() => []);
  if (cotizaciones.length === 0 && !puedeCotizar) return null;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-secondary">Cotizaciones</h2>
        <p className="text-sm text-base-content/60">Trabajo fuera del catálogo. Al aceptarla, sus líneas pasan a esta orden.</p>
      </div>

      {puedeCotizar && <NuevaCotizacionForm destino={{ tipo: "orden", id: idOrden }} />}

      {cotizaciones.map((cotizacion) => (
        <TarjetaCotizacion key={cotizacion.idCotizacion} cotizacion={cotizacion} />
      ))}
    </section>
  );
}
