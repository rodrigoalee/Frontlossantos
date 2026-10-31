/** Teléfono con código de país, como lo pide WhatsApp: +50255551234. */
export const TELEFONO_E164 = /^\+[1-9]\d{7,14}$/;

export const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Quita espacios y guiones; un número local de 8 dígitos se completa con el código de Guatemala. */
export function completarTelefono(valor: string) {
  const limpio = valor.replace(/[\s-]/g, "");
  return /^\d{8}$/.test(limpio) ? `+502${limpio}` : limpio;
}

export function alSalirDelTelefono(evento: { currentTarget: HTMLInputElement }) {
  evento.currentTarget.value = completarTelefono(evento.currentTarget.value);
}
