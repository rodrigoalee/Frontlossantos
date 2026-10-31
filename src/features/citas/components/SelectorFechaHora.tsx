"use client";

import AvisoAccion from "@/components/AvisoAccion";
import { DayPicker } from "@daypicker/react";
import { es } from "@daypicker/react/locale";
import "@daypicker/react/style.css";
import { useEffect, useState, type CSSProperties } from "react";
import { consultarDisponibilidad } from "../actions";
import { formatearHora } from "../formato";
import type { DiaDisponibilidad } from "../types";

const DIAS_VENTANA = 60;

const ESTILO_CALENDARIO = {
  "--rdp-accent-color": "var(--color-primary)",
  "--rdp-accent-background-color": "color-mix(in oklab, var(--color-primary) 15%, transparent)",
  "--rdp-day-height": "40px",
  "--rdp-day-width": "40px",
  "--rdp-day_button-height": "38px",
  "--rdp-day_button-width": "38px",
} as CSSProperties;

function clave(fecha: Date) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function desdeClave(valor: string) {
  const [anio, mes, dia] = valor.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function rangoDelMes(mes: Date) {
  return {
    desde: clave(new Date(mes.getFullYear(), mes.getMonth(), 1)),
    hasta: clave(new Date(mes.getFullYear(), mes.getMonth() + 1, 0)),
  };
}

type Carga = { consulta: string; dias?: Map<string, DiaDisponibilidad>; error?: string };

type Props = {
  sucursalId: number;
  valor: string | null;
  onCambio: (fechaHora: string | null) => void;
};

export default function SelectorFechaHora({ sucursalId, valor, onCambio }: Props) {
  const hoy = new Date();
  const primerMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const limite = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + DIAS_VENTANA);

  const [mes, setMes] = useState(primerMes);
  const [diaElegido, setDiaElegido] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [carga, setCarga] = useState<Carga | null>(null);

  const { desde, hasta } = rangoDelMes(mes);
  const consulta = `${desde}|${intento}`;
  const cargando = carga?.consulta !== consulta;
  const dias = cargando ? undefined : carga.dias;

  useEffect(() => {
    let vigente = true;
    consultarDisponibilidad(sucursalId, desde, hasta).then((resultado) => {
      if (!vigente) return;
      setCarga(
        "error" in resultado
          ? { consulta, error: resultado.error }
          : { consulta, dias: new Map(resultado.dias.map((dia) => [dia.fecha, dia])) },
      );
    });
    return () => {
      vigente = false;
    };
  }, [sucursalId, desde, hasta, consulta]);

  const tieneLibres = (fecha: Date) => dias?.get(clave(fecha))?.horarios.some((h) => h.disponible) ?? false;
  const estaLleno = (fecha: Date) => {
    const horarios = dias?.get(clave(fecha))?.horarios ?? [];
    return horarios.some((h) => h.lleno) && !horarios.some((h) => h.disponible);
  };

  const horarios = diaElegido ? (dias?.get(diaElegido)?.horarios ?? []) : [];

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start">
      <div className="relative self-center md:self-start">
        <DayPicker
          mode="single"
          locale={es}
          month={mes}
          onMonthChange={setMes}
          startMonth={primerMes}
          endMonth={limite}
          selected={diaElegido ? desdeClave(diaElegido) : undefined}
          onSelect={(fecha) => {
            setDiaElegido(fecha ? clave(fecha) : null);
            onCambio(null);
          }}
          disabled={(fecha) => !tieneLibres(fecha)}
          modifiers={{ lleno: estaLleno }}
          modifiersClassNames={{
            lleno:
              "relative after:absolute after:bottom-0.5 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary after:content-['']",
          }}
          style={ESTILO_CALENDARIO}
        />
        {cargando && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-base-100/70">
            <span className="loading loading-spinner text-primary" aria-label="Cargando disponibilidad" />
          </div>
        )}
        <p className="mt-2 flex items-center gap-2 text-xs text-base-content/60">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          Día sin horarios libres
        </p>
      </div>

      <div className="flex-1">
        {carga?.error && !cargando ? (
          <div className="flex flex-col items-start gap-3 text-sm text-base-content/60">
            No se pudieron cargar los horarios.
            <button type="button" onClick={() => setIntento((n) => n + 1)} className="btn btn-sm rounded-full">
              Reintentar
            </button>
            <AvisoAccion accion={{ texto: "Reintentar", onClick: () => setIntento((n) => n + 1) }}>{carga.error}</AvisoAccion>
          </div>
        ) : !diaElegido ? (
          <p className="text-sm text-base-content/60">Elige un día en el calendario para ver sus horarios.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {horarios.map((horario) => {
              const elegido = valor === horario.fechaHora;
              return (
                <button
                  key={horario.fechaHora}
                  type="button"
                  disabled={!horario.disponible}
                  aria-pressed={elegido}
                  onClick={() => onCambio(horario.fechaHora)}
                  className={`btn btn-sm h-auto min-h-10 flex-col gap-0 rounded-xl py-1 font-medium shadow-none ${
                    elegido
                      ? "btn-primary"
                      : "border-base-300 bg-base-100 hover:border-primary hover:bg-primary/10"
                  }`}
                >
                  <span className={horario.lleno ? "line-through" : undefined}>{formatearHora(horario.fechaHora)}</span>
                  {horario.lleno && <span className="text-[10px] font-semibold uppercase">Lleno</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
