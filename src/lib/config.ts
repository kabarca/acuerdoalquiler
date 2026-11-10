// Número de WhatsApp del soporte de Acuerdo Alquiler, en formato internacional sin
// signos (código de país + número, p. ej. "506XXXXXXXX" para Costa Rica).
// TODO: reemplazar por el número real de soporte de Thomas.
export const SOPORTE_WHATSAPP_NUMERO = "50600000000";

export function linkWhatsAppSoporte(mensaje: string) {
  return `https://wa.me/${SOPORTE_WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

// Dirección pública del sitio, la que llevan los links de los correos (pago,
// verificación, invitación). Por defecto es el sitio real: un link a
// "localhost" no abre en el celular de quien recibe el correo. Para probar con
// otra dirección se puede definir NEXT_PUBLIC_APP_URL.
export function urlBase() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.acuerdoalquiler.com").replace(/\/+$/, "");
}
