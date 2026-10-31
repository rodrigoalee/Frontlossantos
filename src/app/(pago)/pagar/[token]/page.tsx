import { Suspense } from "react";
import PasarelaPago from "@/features/pagos/components/PasarelaPago";
import { obtenerResumenPago } from "@/features/pagos/dal";
import type { ResumenPago } from "@/features/pagos/types";
import { ApiError } from "@/lib/api";

function Aviso({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  return (
    <main className="container py-5">
      <div className="card tarjeta-pago mx-auto border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-sm-5 text-center">
          <p className="small fw-semibold text-uppercase text-secondary mb-4">Los Santos Customs</p>
          <h1 className="h4 fw-bold text-marca">{titulo}</h1>
          <p className="text-secondary mb-0">{mensaje}</p>
        </div>
      </div>
    </main>
  );
}

async function Pasarela({ token }: { token: string }) {
  let resumen: ResumenPago;
  try {
    resumen = await obtenerResumenPago(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <Aviso titulo="Enlace no válido" mensaje="Este enlace de pago venció o no existe. Pide uno nuevo en el taller." />;
    }
    if (error instanceof ApiError && error.status === 429) {
      return <Aviso titulo="Demasiados intentos" mensaje="Espera unos minutos y vuelve a abrir el enlace." />;
    }
    throw error;
  }

  return <PasarelaPago token={token} resumen={resumen} />;
}

export default function PagarPage({ params }: PageProps<"/pagar/[token]">) {
  return (
    <Suspense
      fallback={
        <main className="container py-5 text-center">
          <span className="spinner-border text-secondary" role="status" aria-label="Cargando" />
        </main>
      }
    >
      {params.then(({ token }) => (
        <Pasarela token={token} />
      ))}
    </Suspense>
  );
}
