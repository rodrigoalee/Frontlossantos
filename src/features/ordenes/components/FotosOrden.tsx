"use client";

import AvisoAccion from "@/components/AvisoAccion";
import ConfirmacionAccion from "@/components/ConfirmacionAccion";
import { useState, useTransition } from "react";
import { FaCamera, FaImages } from "react-icons/fa6";
import { comprimirFoto } from "@/lib/comprimirFoto";
import { quitarFotoOrden, subirFotoOrden } from "../actions";
import type { FotoOrden } from "../types";
import GaleriaFotos from "./GaleriaFotos";

const MAXIMO_FOTOS = 20;

type Mensaje = { tipo: "ok" | "error"; texto: string };

export default function FotosOrden({ idOrden, fotos }: { idOrden: number; fotos: FotoOrden[] }) {
  const [descripcion, setDescripcion] = useState("");
  const [progreso, setProgreso] = useState<string>();
  const [mensaje, setMensaje] = useState<Mensaje>();
  const [porQuitar, setPorQuitar] = useState<FotoOrden>();
  const [quitando, startQuitar] = useTransition();
  const [subiendo, startSubir] = useTransition();
  const lleno = fotos.length >= MAXIMO_FOTOS;

  function subir(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(evento.target.files ?? []).slice(0, MAXIMO_FOTOS - fotos.length);
    evento.target.value = "";
    if (archivos.length === 0) return;

    setMensaje(undefined);
    startSubir(async () => {
      for (const [i, archivo] of archivos.entries()) {
        setProgreso(archivos.length > 1 ? `Subiendo ${i + 1} de ${archivos.length}…` : "Subiendo foto…");
        const datos = new FormData();
        try {
          datos.set("foto", await comprimirFoto(archivo));
        } catch {
          setMensaje({ tipo: "error", texto: `No se pudo leer "${archivo.name}". Prueba con otra foto.` });
          break;
        }
        datos.set("descripcion", descripcion);

        const resultado = await subirFotoOrden(idOrden, datos);
        if (resultado?.error) {
          setMensaje({ tipo: "error", texto: resultado.error });
          break;
        }
        if (i === archivos.length - 1) {
          setMensaje({ tipo: "ok", texto: archivos.length > 1 ? "Fotos guardadas." : "Foto guardada." });
          setDescripcion("");
        }
      }
      setProgreso(undefined);
    });
  }

  function quitar() {
    if (!porQuitar) return;
    setMensaje(undefined);
    startQuitar(async () => {
      const resultado = await quitarFotoOrden(idOrden, porQuitar.idFoto);
      setMensaje(resultado?.error ? { tipo: "error", texto: resultado.error } : { tipo: "ok", texto: "Foto quitada." });
      setPorQuitar(undefined);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {fotos.length > 0 && (
        <GaleriaFotos fotos={fotos} alQuitar={setPorQuitar} quitando={quitando ? porQuitar?.idFoto : undefined} />
      )}

      {lleno ? (
        <p className="text-sm text-base-content/60">Llegaste al máximo de {MAXIMO_FOTOS} fotos; quita alguna para subir otra.</p>
      ) : (
        <>
          <input
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
            maxLength={200}
            disabled={subiendo}
            placeholder="Qué muestra la foto (opcional)"
            aria-label="Descripción de la foto"
            className="input w-full rounded-full"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className={`btn btn-sm btn-primary rounded-full px-5 ${subiendo ? "btn-disabled" : ""}`}>
              {subiendo ? <span className="loading loading-spinner loading-xs" /> : <FaCamera aria-hidden className="size-3.5" />}
              Tomar foto
              <input type="file" accept="image/*" capture="environment" onChange={subir} disabled={subiendo} className="hidden" />
            </label>
            <label className={`btn btn-sm rounded-full px-5 ${subiendo ? "btn-disabled" : ""}`}>
              <FaImages aria-hidden className="size-3.5" />
              Elegir de la galería
              <input type="file" accept="image/*" multiple onChange={subir} disabled={subiendo} className="hidden" />
            </label>
            {progreso && <span className="text-sm text-base-content/60">{progreso}</span>}
          </div>
        </>
      )}

      {mensaje && (
        <AvisoAccion exito={mensaje.tipo !== "error"} origen={mensaje}>
          {mensaje.texto}
        </AvisoAccion>
      )}

      {porQuitar && (
        <ConfirmacionAccion
          titulo="¿Quitar esta foto?"
          mensaje="El cliente ya no la verá en el seguimiento de su cita."
          textoConfirmar="Quitar foto"
          pendiente={quitando}
          onConfirmar={quitar}
          onCancelar={() => setPorQuitar(undefined)}
        />
      )}
    </div>
  );
}
