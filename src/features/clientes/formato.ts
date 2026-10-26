const TELEFONO_GUATEMALA = /^\+502(\d{4})(\d{4})$/;

export function formatearTelefono(telefono: string) {
  const partes = telefono.replace(/[\s-]/g, "").match(TELEFONO_GUATEMALA);
  return partes ? `+502 ${partes[1]}-${partes[2]}` : telefono;
}
