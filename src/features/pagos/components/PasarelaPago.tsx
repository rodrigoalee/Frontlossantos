"use client";

import { useState, useTransition } from "react";
import { formatearMoneda } from "@/features/citas/formato";
import { pagarConTarjeta } from "../actions";
import type { ResultadoPago, ResumenPago } from "../types";

type Pantalla = "resumen" | "tarjeta" | "resultado";

function soloDigitos(valor: string, maximo: number) {
  return valor.replace(/\D/g, "").slice(0, maximo);
}

/** Agrupa de 4 en 4 como viene impreso en la tarjeta. */
function formatearNumero(valor: string) {
  return soloDigitos(valor, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** MM/AA con la barra automática. */
function formatearVencimiento(valor: string) {
  const digitos = soloDigitos(valor, 4);
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

function marcaDe(numero: string) {
  if (/^4/.test(numero)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(numero)) return "Mastercard";
  return null;
}

function Resumen({ resumen, onPagar }: { resumen: ResumenPago; onPagar: () => void }) {
  return (
    <>
      <p className="mb-1 text-secondary">Hola, {resumen.nombreCliente}</p>
      <h1 className="h4 fw-bold text-marca">Tu vehículo está listo</h1>
      <p className="small text-secondary mb-4">
        {resumen.vehiculo} · Sede {resumen.sucursal} · Factura #{resumen.idFactura}
      </p>

      <ul className="list-group list-group-flush mb-3">
        {resumen.lineas.map((linea, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between gap-3 px-0">
            <span>
              {linea.descripcion}
              {linea.cantidad > 1 && <span className="text-secondary"> × {linea.cantidad}</span>}
            </span>
            <span className="text-nowrap">{formatearMoneda(linea.subtotal)}</span>
          </li>
        ))}
      </ul>

      <dl className="row small mb-4">
        <dt className="col-6 fw-normal text-secondary">Subtotal</dt>
        <dd className="col-6 text-end mb-1">{formatearMoneda(resumen.subtotal)}</dd>
        <dt className="col-6 fw-normal text-secondary">IVA</dt>
        <dd className="col-6 text-end mb-1">{formatearMoneda(resumen.montoImpuesto)}</dd>
        <dt className="col-6 fs-5 fw-bold text-marca">Total</dt>
        <dd className="col-6 fs-5 fw-bold text-end text-marca mb-0">{formatearMoneda(resumen.total)}</dd>
      </dl>

      <button type="button" onClick={onPagar} className="btn btn-marca btn-lg rounded-pill w-100 fw-semibold py-3">
        Pagar {formatearMoneda(resumen.total)}
      </button>
    </>
  );
}

function FormTarjeta({ token, total, onResultado, onCancelar }: {
  token: string;
  total: number;
  onResultado: (resultado: ResultadoPago) => void;
  onCancelar: () => void;
}) {
  const [numero, setNumero] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvc, setCvc] = useState("");
  const [titular, setTitular] = useState("");
  const [error, setError] = useState<string>();
  const [pendiente, startTransition] = useTransition();
  const marca = marcaDe(numero);

  function pagar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const resultado = await pagarConTarjeta(token, { numeroTarjeta: numero, vencimiento, cvc, titular: titular.trim() });
      // Un rechazo se queda en el formulario para corregir o cambiar de tarjeta.
      if (resultado.pagado) onResultado(resultado);
      else setError(resultado.mensaje);
    });
  }

  return (
    <form onSubmit={pagar}>
      <h1 className="h5 fw-bold text-marca mb-3">Información de la tarjeta</h1>

      <div className="mb-3">
        <label htmlFor="numero" className="form-label small text-secondary">
          Número de tarjeta
        </label>
        <div className="input-group">
          <input
            id="numero"
            className="form-control form-control-lg"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 1234 1234 1234"
            value={numero}
            onChange={(e) => setNumero(formatearNumero(e.target.value))}
            minLength={15}
            required
            autoFocus
          />
          {marca && <span className="input-group-text small fw-semibold">{marca}</span>}
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <label htmlFor="vencimiento" className="form-label small text-secondary">
            Vencimiento
          </label>
          <input
            id="vencimiento"
            className="form-control form-control-lg"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={vencimiento}
            onChange={(e) => setVencimiento(formatearVencimiento(e.target.value))}
            pattern="(0[1-9]|1[0-2])/\d{2}"
            required
          />
        </div>
        <div className="col-6">
          <label htmlFor="cvc" className="form-label small text-secondary">
            CVC
          </label>
          <input
            id="cvc"
            className="form-control form-control-lg"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(soloDigitos(e.target.value, 4))}
            pattern="\d{3,4}"
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="titular" className="form-label small text-secondary">
          Nombre en la tarjeta
        </label>
        <input
          id="titular"
          className="form-control form-control-lg"
          autoComplete="cc-name"
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      {error && (
        <div role="alert" className="alert alert-danger py-2 small">
          {error}
        </div>
      )}

      <div className="d-grid gap-2 mt-4">
        <button type="submit" disabled={pendiente} className="btn btn-marca btn-lg rounded-pill fw-semibold py-3">
          {pendiente && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
          {pendiente ? "Procesando…" : `Pagar ${formatearMoneda(total)}`}
        </button>
        <button type="button" onClick={onCancelar} disabled={pendiente} className="btn btn-outline-marca btn-lg rounded-pill fw-semibold py-3">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Resultado({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  return (
    <div className="text-center py-4">
      <div
        className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3 fs-1"
        style={{ width: "4.5rem", height: "4.5rem" }}
        aria-hidden
      >
        ✓
      </div>
      <h1 className="h4 fw-bold text-marca">{titulo}</h1>
      <p className="text-secondary mb-0">{mensaje}</p>
    </div>
  );
}

export default function PasarelaPago({ token, resumen }: { token: string; resumen: ResumenPago }) {
  const [pantalla, setPantalla] = useState<Pantalla>(resumen.pagada ? "resultado" : "resumen");
  const [mensaje, setMensaje] = useState("Esta factura ya está pagada. ¡Gracias!");

  return (
    <main className="container py-4 py-sm-5">
      <div className="card tarjeta-pago mx-auto border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-sm-5">
          <p className="small fw-semibold text-uppercase text-secondary mb-4">Los Santos Customs</p>

          {pantalla === "resumen" && <Resumen resumen={resumen} onPagar={() => setPantalla("tarjeta")} />}
          {pantalla === "tarjeta" && (
            <FormTarjeta
              token={token}
              total={resumen.total}
              onCancelar={() => setPantalla("resumen")}
              onResultado={(resultado) => {
                setMensaje(resultado.mensaje);
                setPantalla("resultado");
              }}
            />
          )}
          {pantalla === "resultado" && <Resultado titulo="Pago completado" mensaje={mensaje} />}
        </div>
      </div>
      <p className="text-center small text-secondary mt-3">Pago seguro · no guardamos los datos de tu tarjeta</p>
    </main>
  );
}
