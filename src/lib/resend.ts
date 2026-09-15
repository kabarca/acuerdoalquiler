import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const REMITENTE = process.env.RESEND_FROM_EMAIL ?? "cobros@ejemplo.com";

export async function enviarFactura(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  monto: string;
  fechaVencimiento: string;
  linkPago: string;
}) {
  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Factura de alquiler — ${params.direccionPropiedad}`,
    html: `
      <p>Hola ${params.nombreInquilino},</p>
      <p>Este es el recordatorio de pago de tu alquiler en <strong>${params.direccionPropiedad}</strong>.</p>
      <p>Monto: <strong>₡${params.monto}</strong><br/>Vence: ${params.fechaVencimiento}</p>
      <p><a href="${params.linkPago}">Pagar ahora con tarjeta</a></p>
    `,
  });
}

export async function enviarRecordatorio(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  monto: string;
  linkPago: string;
}) {
  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Recordatorio: alquiler pendiente — ${params.direccionPropiedad}`,
    html: `
      <p>Hola ${params.nombreInquilino},</p>
      <p>Todavía no hemos recibido el pago de tu alquiler (₡${params.monto}) en <strong>${params.direccionPropiedad}</strong>.</p>
      <p><a href="${params.linkPago}">Pagar ahora con tarjeta</a></p>
    `,
  });
}

export async function avisarArrendadorAtraso(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  diasAtraso: number;
}) {
  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Inquilino atrasado — ${params.direccionPropiedad}`,
    html: `
      <p>${params.nombreInquilino} lleva ${params.diasAtraso} días sin pagar el alquiler de ${params.direccionPropiedad}.</p>
    `,
  });
}
