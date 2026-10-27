const PLACA_GUATEMALTECA = /^([A-Z]{1,3})(\d{3}[A-Z]{3})$/;

export function formatearPlaca(placa: string) {
  const partes = placa.toUpperCase().replace(/[\s-]/g, "").match(PLACA_GUATEMALTECA);
  return partes ? `${partes[1]}-${partes[2]}` : placa;
}

export function alSalirDeLaPlaca(evento: { currentTarget: HTMLInputElement }) {
  evento.currentTarget.value = formatearPlaca(evento.currentTarget.value.trim().toUpperCase());
}
