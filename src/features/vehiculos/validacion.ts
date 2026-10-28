import { AYUDA_PLACA, esPlacaValida } from "./formato";

const ANIO_MINIMO = 1900;
const ANIO_MAXIMO = 2100;

export type DatosVehiculo = { placa: string; marca: string; modelo: string; anio: number };

type VehiculoValidado = {
  error?: string;
  valores: Record<string, string>;
  cuerpo?: DatosVehiculo;
};

/** Normaliza la placa (mayúsculas, sin espacios ni guiones) y valida los datos del vehículo. */
export function validarVehiculo(datos: { placa: string; marca: string; modelo: string; anio: string }): VehiculoValidado {
  const valores = {
    placa: datos.placa.toUpperCase().replace(/[\s-]/g, ""),
    marca: datos.marca.trim(),
    modelo: datos.modelo.trim(),
    anio: datos.anio.trim(),
  };
  const anio = Number(valores.anio);

  if (!valores.placa || !valores.marca || !valores.modelo || !valores.anio) {
    return { error: "Completa la placa, la marca, el modelo y el año.", valores };
  }
  if (!esPlacaValida(valores.placa)) {
    return { error: AYUDA_PLACA, valores };
  }
  if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > ANIO_MAXIMO) {
    return { error: `El año debe estar entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`, valores };
  }
  return { valores, cuerpo: { placa: valores.placa, marca: valores.marca, modelo: valores.modelo, anio } };
}
