import { obtenerCotizacionesDeCita } from "../dal";
import ResponderCotizacion from "./ResponderCotizacion";
import TarjetaCotizacion from "./TarjetaCotizacion";

export default async function CotizacionesCliente({ idCita }: { idCita: number }) {
  const cotizaciones = await obtenerCotizacionesDeCita(idCita).catch(() => []);
  if (cotizaciones.length === 0) return null;

  const pendientes = cotizaciones.filter((c) => c.estado === "Pendiente").length;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-secondary">Cotizaciones del taller</h2>
        <p className="text-sm text-base-content/60">
          {pendientes > 0
            ? "El taller te propone trabajo adicional. Revísalo y dinos si lo aceptas."
            : "Trabajo adicional que el taller te propuso."}
        </p>
      </div>

      {cotizaciones.map((cotizacion) => (
        <TarjetaCotizacion key={cotizacion.idCotizacion} cotizacion={cotizacion}>
          {cotizacion.estado === "Pendiente" && (
            <ResponderCotizacion idCotizacion={cotizacion.idCotizacion} total={cotizacion.total} />
          )}
        </TarjetaCotizacion>
      ))}
    </section>
  );
}
