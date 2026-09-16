// Número de WhatsApp del soporte de Rentia, en formato internacional sin
// signos (código de país + número, p. ej. "506XXXXXXXX" para Costa Rica).
// TODO: reemplazar por el número real de soporte de Thomas.
export const SOPORTE_WHATSAPP_NUMERO = "50600000000";

export function linkWhatsAppSoporte(mensaje: string) {
  return `https://wa.me/${SOPORTE_WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}
