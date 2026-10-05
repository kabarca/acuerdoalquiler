import { Resend } from "resend";

// La cuenta real de Resend todavía no está conectada — la key vacía haría
// que el SDK truene desde el import, así que se usa un placeholder cuando
// no hay una real. Los envíos simplemente fallarán con un error de la API
// hasta que se configure RESEND_API_KEY de verdad.
export const resend = new Resend(process.env.RESEND_API_KEY || "re_sin_configurar");

const REMITENTE = process.env.RESEND_FROM_EMAIL ?? "cobros@ejemplo.com";

// Hasta que Thomas conecte Resend de verdad, RESEND_API_KEY queda vacía y
// ningún correo sale. Todo el código que manda correos pasa por
// intentarEnvio(): si no hay llave ni siquiera lo intenta (más rápido y sin
// ruido en los logs) y devuelve el motivo para que la app lo muestre.
export function correoConfigurado() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function intentarEnvio(
  enviar: () => Promise<{ error: { message: string } | null }>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!correoConfigurado()) {
    return { ok: false, error: "El envío de correos todavía no está configurado" };
  }
  try {
    const resultado = await enviar();
    // El SDK de Resend NO lanza excepción cuando falla, devuelve { error }.
    if (resultado.error) {
      return { ok: false, error: resultado.error.message };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo enviar el correo" };
  }
}

// Paleta de marca de Rentia, en variables ya resueltas (los clientes de
// correo no soportan `var(--token)`).
const INK = "#101826";
const INK_SOFT = "#55637a";
const INK_FAINT = "#8895a7";
const BG = "#f5f8fb";
const SURFACE = "#ffffff";
const BORDER = "#e3e8f0";
const PRIMARY = "#1f4e8c";
const WARNING = "#a8660f";
const WARNING_BG = "#fdf1de";
const DANGER = "#b93a2b";
const DANGER_BG = "#fbe9e6";

function envoltura(contenido: string) {
  return `
    <div style="background:${BG}; padding:36px 0; font-family:'Public Sans', Arial, sans-serif; color:${INK};">
      <div style="max-width:500px; margin:0 auto; background:${SURFACE}; border-radius:16px; border:1px solid ${BORDER}; overflow:hidden;">
        <div style="padding:22px 32px; border-bottom:1px solid ${BORDER}; display:flex; align-items:center; gap:10px;">
          <div style="width:26px; height:26px; border-radius:7px; background:${PRIMARY}; display:inline-block; text-align:center; line-height:26px;">
            <span style="color:#fff; font-weight:700; font-size:13px;">R</span>
          </div>
          <span style="font-weight:700; font-size:15px; vertical-align:middle;">Rentia</span>
        </div>
        ${contenido}
      </div>
    </div>
  `;
}

export async function enviarFactura(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  monto: string;
  fechaVencimiento: string;
  periodo: string;
  linkPago: string;
}) {
  const html = envoltura(`
    <div style="padding:32px;">
      <div style="font-size:13px; color:${INK_FAINT}; font-weight:600;">FACTURA DE ARRIENDO · ${params.periodo.toUpperCase()}</div>
      <h1 style="font-size:20px; margin:8px 0 6px;">Estimado(a) ${params.nombreInquilino}, ya está lista su factura</h1>
      <p style="color:${INK_SOFT}; font-size:14.5px; line-height:1.6;">
        Esta es la factura del arriendo de <strong>${params.direccionPropiedad}</strong>. Pague por transferencia
        bancaria y suba su comprobante desde el enlace de abajo.
      </p>
      <div style="background:${WARNING_BG}; border-radius:12px; padding:16px 20px; margin-top:16px;">
        <div style="font-size:12.5px; font-weight:700; color:${WARNING};">FECHA MÁXIMA DE PAGO</div>
        <div style="font-size:19px; font-weight:700; margin-top:4px;">${params.fechaVencimiento}</div>
      </div>
      <div style="background:${BG}; border-radius:12px; padding:18px 20px; margin-top:12px;">
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid ${BORDER}; font-size:14px;">
          <span style="color:${INK_SOFT};">Propiedad</span><span style="font-weight:600;">${params.direccionPropiedad}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:16px;">
          <span style="font-weight:700;">Total a pagar</span><span style="font-weight:700;">₡${params.monto}</span>
        </div>
      </div>
      <a href="${params.linkPago}" style="display:block; margin-top:20px; background:${PRIMARY}; color:#fff; border-radius:10px; padding:15px; text-align:center; font-weight:700; font-size:15px; text-decoration:none;">
        Ver datos de pago
      </a>
    </div>
    <div style="padding:18px 32px; border-top:1px solid ${BORDER}; color:${INK_FAINT}; font-size:11.5px; text-align:center;">
      Este correo fue enviado por Rentia en nombre de su arrendador.
    </div>
  `);

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Factura de arriendo — pague antes del ${params.fechaVencimiento}`,
    html,
  });
}

export async function enviarRecordatorio(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  monto: string;
  fechaVencimiento: string;
  linkPago: string;
}) {
  const html = envoltura(`
    <div style="padding:32px;">
      <div style="font-weight:700; font-size:13px; color:${WARNING};">RECORDATORIO DE PAGO</div>
      <h1 style="font-size:19px; margin:8px 0 6px;">Su arriendo sigue pendiente</h1>
      <p style="color:${INK_SOFT}; font-size:14.5px; line-height:1.6;">
        Estimado(a) ${params.nombreInquilino}, el pago de su arriendo de <strong>${params.direccionPropiedad}</strong>
        venció el ${params.fechaVencimiento}. Le recomendamos realizarlo hoy mismo para evitar que se notifique a
        su arrendador.
      </p>
      <div style="background:${WARNING_BG}; border-radius:10px; padding:16px 18px; margin-top:12px;">
        <span style="font-weight:700; font-size:18px;">₡${params.monto}</span>
      </div>
      <a href="${params.linkPago}" style="display:block; margin-top:20px; background:${PRIMARY}; color:#fff; border-radius:10px; padding:14px; text-align:center; font-weight:700; font-size:14.5px; text-decoration:none;">
        Pagar ahora
      </a>
    </div>
    <div style="padding:18px 32px; border-top:1px solid ${BORDER}; color:${INK_FAINT}; font-size:11.5px; text-align:center;">
      Si ya realizó este pago, puede hacer caso omiso de este mensaje.
    </div>
  `);

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Recordatorio: arriendo pendiente — ${params.direccionPropiedad}`,
    html,
  });
}

export async function avisarArrendadorAtraso(params: {
  paraEmail: string;
  nombreArrendador: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  monto: string;
  fechaVencimiento: string;
  diasAtraso: number;
}) {
  const html = envoltura(`
    <div style="padding:32px;">
      <div style="font-weight:700; font-size:13px; color:${DANGER};">ARRIENDO VENCIDO · REQUIERE SU ATENCIÓN</div>
      <h1 style="font-size:19px; margin:8px 0 6px;">Su inquilino no ha realizado el pago del arriendo</h1>
      <p style="color:${INK_SOFT}; font-size:14.5px; line-height:1.6;">
        Estimado(a) ${params.nombreArrendador}, le informamos que <strong>${params.nombreInquilino}</strong> no ha
        realizado el pago del arriendo correspondiente a <strong>${params.direccionPropiedad}</strong>. Han
        transcurrido <strong>${params.diasAtraso} días</strong> desde la fecha de vencimiento.
      </p>
      <div style="background:${DANGER_BG}; border-radius:10px; padding:16px 18px; margin-top:12px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; font-size:14px;">
          <span>Monto pendiente</span><span style="font-weight:700;">₡${params.monto}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:14px;">
          <span>Venció el</span><span style="font-weight:600;">${params.fechaVencimiento}</span>
        </div>
      </div>
    </div>
  `);

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Inquilino atrasado — ${params.direccionPropiedad}`,
    html,
  });
}

export async function enviarInvitacion(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  monto: string;
  linkInvitacion: string;
}) {
  const html = envoltura(`
    <div style="padding:32px;">
      <h1 style="font-size:19px; margin:0 0 6px;">Configure el pago de su arriendo</h1>
      <p style="color:${INK_SOFT}; font-size:14.5px; line-height:1.6;">
        Hola ${params.nombreInquilino}, su arrendador le ha invitado a registrar su método de pago
        para <strong>${params.direccionPropiedad}</strong> — ₡${params.monto} mensuales. Registre su
        cuenta bancaria o tarjeta para activarlo.
      </p>
      <a href="${params.linkInvitacion}" style="display:block; margin-top:20px; background:${PRIMARY}; color:#fff; border-radius:10px; padding:15px; text-align:center; font-weight:700; font-size:15px; text-decoration:none;">
        Configurar método de pago
      </a>
    </div>
  `);

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Configure el pago de su arriendo — ${params.direccionPropiedad}`,
    html,
  });
}

export async function enviarVerificacionIdentidad(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  linkVerificacion: string;
}) {
  const html = envoltura(`
    <div style="padding:32px;">
      <h1 style="font-size:19px; margin:0 0 6px;">Verifique su identidad</h1>
      <p style="color:${INK_SOFT}; font-size:14.5px; line-height:1.6;">
        Hola ${params.nombreInquilino}, su arrendador de <strong>${params.direccionPropiedad}</strong> le pide
        confirmar su identidad. Abra este enlace desde su celular: le pedirá una foto de su cédula y una selfie,
        directamente con la cámara — no necesita descargar nada.
      </p>
      <a href="${params.linkVerificacion}" style="display:block; margin-top:20px; background:${PRIMARY}; color:#fff; border-radius:10px; padding:15px; text-align:center; font-weight:700; font-size:15px; text-decoration:none;">
        Verificar mi identidad
      </a>
      <p style="color:${INK_FAINT}; font-size:12px; margin-top:14px;">
        Este enlace vence en 7 días por seguridad.
      </p>
    </div>
  `);

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Verifique su identidad — ${params.direccionPropiedad}`,
    html,
  });
}
