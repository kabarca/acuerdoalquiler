import { Resend } from "resend";
import { LOGO_CORREO_BASE64 } from "@/lib/logo-correo";

// La cuenta real de Resend todavía no está conectada — la key vacía haría
// que el SDK truene desde el import, así que se usa un placeholder cuando
// no hay una real. Los envíos simplemente fallarán con un error de la API
// hasta que se configure RESEND_API_KEY de verdad.
export const resend = new Resend(process.env.RESEND_API_KEY || "re_sin_configurar");

const REMITENTE = process.env.RESEND_FROM_EMAIL ?? "cobros@acuerdoalquiler.com";

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

// Paleta del sitio público de Acuerdo Alquiler (serio, de registro/crédito), en
// valores ya resueltos: los clientes de correo no soportan `var(--token)`.
const INK = "#101820";
const BODY = "#31373d";
const MUTED = "#55637a";
const FAINT = "#8a949f";
const PAGE = "#eef1f4";
const SURFACE = "#ffffff";
const PANEL = "#f3f1ea";
const BORDER = "#d8d5cc";
const PRIMARY = "#1a7b99";
const GOLD = "#af8462";
const WARNING = "#8a5a12";
const WARNING_BG = "#fbf3e4";
const DANGER = "#b93a2b";
const DANGER_BG = "#fbe9e6";

const FUENTE = "'Fira Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Todos los correos llevan el logo como imagen adjunta en línea (cid:logo).
const ADJUNTO_LOGO = [
  { filename: "logo.png", content: LOGO_CORREO_BASE64, contentType: "image/png", contentId: "logo" },
];

// Los correos usan tablas y estilos en línea a propósito: Gmail, Outlook y
// Apple Mail ignoran flexbox y casi todo el CSS moderno.
function envoltura(contenido: string, opciones: { etiqueta: string; pie?: string }) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE}; padding:32px 12px; font-family:${FUENTE}; color:${BODY};">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%; max-width:560px; background:${SURFACE}; border:1px solid ${BORDER}; border-top:4px solid ${PRIMARY};">
      <tr>
        <td style="background:${INK}; padding:20px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="44" valign="middle"><img src="cid:logo" width="36" height="36" alt="" style="display:block; border:0;"></td>
            <td valign="middle" style="font-family:${FUENTE}; font-size:17px; font-weight:700; color:#ffffff; letter-spacing:0.2px;">Acuerdo Alquiler</td>
            <td align="right" valign="middle" style="font-family:${FUENTE}; font-size:10.5px; font-weight:700; color:${GOLD}; letter-spacing:1.6px; text-transform:uppercase;">${opciones.etiqueta}</td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="padding:36px 32px 32px;">${contenido}</td></tr>
      <tr>
        <td style="background:${PANEL}; border-top:1px solid ${BORDER}; padding:20px 32px; font-family:${FUENTE}; font-size:12px; line-height:1.6; color:${FAINT};">
          ${opciones.pie ?? "Este correo fue enviado por Acuerdo Alquiler en nombre de su arrendador."}
          <div style="margin-top:6px; color:${FAINT};">Acuerdo Alquiler &middot; Registro de pago de alquileres &middot; Costa Rica</div>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`;
}

function titulo(texto: string) {
  return `<h1 style="margin:0 0 12px; font-family:${FUENTE}; font-size:23px; line-height:1.3; font-weight:600; color:${INK};">${texto}</h1>`;
}

function parrafo(texto: string) {
  return `<p style="margin:0 0 18px; font-family:${FUENTE}; font-size:15px; line-height:1.65; color:${BODY};">${texto}</p>`;
}

function boton(href: string, texto: string) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;"><tr><td align="center" bgcolor="${PRIMARY}" style="background:${PRIMARY};">
  <a href="${href}" style="display:block; padding:16px 24px; font-family:${FUENTE}; font-size:14px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#ffffff; text-decoration:none;">${texto}</a>
</td></tr></table>`;
}

// Bloque destacado (fecha máxima, monto, atraso).
function destacado(etiqueta: string, valor: string, tono: "aviso" | "peligro" | "neutro" = "neutro") {
  const fondo = tono === "aviso" ? WARNING_BG : tono === "peligro" ? DANGER_BG : PANEL;
  const color = tono === "aviso" ? WARNING : tono === "peligro" ? DANGER : MUTED;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;"><tr>
  <td style="background:${fondo}; border-left:4px solid ${color}; padding:16px 20px;">
    <div style="font-family:${FUENTE}; font-size:11.5px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${color};">${etiqueta}</div>
    <div style="margin-top:4px; font-family:${FUENTE}; font-size:22px; font-weight:600; color:${INK};">${valor}</div>
  </td>
</tr></table>`;
}

function filas(datos: { etiqueta: string; valor: string; fuerte?: boolean }[]) {
  const celdas = datos
    .map(
      (d, i) => `
  <tr>
    <td style="padding:12px 0; ${i < datos.length - 1 ? `border-bottom:1px solid ${BORDER};` : `border-top:2px solid ${INK};`} font-family:${FUENTE}; font-size:${d.fuerte ? "16px" : "14px"}; color:${d.fuerte ? INK : MUTED}; ${d.fuerte ? "font-weight:700;" : ""}">${d.etiqueta}</td>
    <td align="right" style="padding:12px 0; ${i < datos.length - 1 ? `border-bottom:1px solid ${BORDER};` : `border-top:2px solid ${INK};`} font-family:${FUENTE}; font-size:${d.fuerte ? "20px" : "14px"}; color:${INK}; font-weight:${d.fuerte ? "700" : "600"};">${d.valor}</td>
  </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 0;">${celdas}</table>`;
}

function etiquetaSuperior(texto: string, color = MUTED) {
  return `<div style="margin:0 0 10px; font-family:${FUENTE}; font-size:12px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:${color};">${texto}</div>`;
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
  const html = envoltura(
    `
    ${etiquetaSuperior(`Factura de arriendo &middot; ${params.periodo}`)}
    ${titulo(`Su factura de ${params.monto} ya está disponible`)}
    ${parrafo(`Estimado(a) ${params.nombreInquilino}, esta es la factura del arriendo de <strong>${params.direccionPropiedad}</strong>. Pague por transferencia bancaria y suba su comprobante desde el enlace de abajo.`)}
    ${destacado("Fecha máxima de pago", params.fechaVencimiento, "aviso")}
    ${filas([
      { etiqueta: "Propiedad", valor: params.direccionPropiedad },
      { etiqueta: "Periodo", valor: params.periodo },
      { etiqueta: "Total a pagar", valor: params.monto, fuerte: true },
    ])}
    ${boton(params.linkPago, "Ver datos de pago")}
  `,
    { etiqueta: "Factura" },
  );

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Factura de arriendo — pague antes del ${params.fechaVencimiento}`,
    html,
    attachments: ADJUNTO_LOGO,
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
  const html = envoltura(
    `
    ${etiquetaSuperior("Recordatorio de pago", WARNING)}
    ${titulo("Su arriendo sigue pendiente")}
    ${parrafo(`Estimado(a) ${params.nombreInquilino}, el pago del arriendo de <strong>${params.direccionPropiedad}</strong> venció el ${params.fechaVencimiento}. Le recomendamos realizarlo hoy mismo para evitar que se notifique a su arrendador.`)}
    ${destacado("Monto pendiente", params.monto, "aviso")}
    ${boton(params.linkPago, "Pagar ahora")}
  `,
    { etiqueta: "Recordatorio", pie: "Si ya realizó este pago, puede hacer caso omiso de este mensaje." },
  );

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Recordatorio: arriendo pendiente — ${params.direccionPropiedad}`,
    html,
    attachments: ADJUNTO_LOGO,
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
  const html = envoltura(
    `
    ${etiquetaSuperior("Arriendo vencido &middot; requiere su atención", DANGER)}
    ${titulo("Su inquilino no ha realizado el pago del arriendo")}
    ${parrafo(`Estimado(a) ${params.nombreArrendador}, <strong>${params.nombreInquilino}</strong> no ha realizado el pago del arriendo de <strong>${params.direccionPropiedad}</strong>. Han transcurrido <strong>${params.diasAtraso} días</strong> desde la fecha de vencimiento.`)}
    ${destacado("Monto pendiente", params.monto, "peligro")}
    ${filas([
      { etiqueta: "Venció el", valor: params.fechaVencimiento },
      { etiqueta: "Días de atraso", valor: String(params.diasAtraso) },
    ])}
  `,
    { etiqueta: "Aviso", pie: "Usted recibe este aviso porque es el arrendador registrado de esta propiedad." },
  );

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Inquilino atrasado — ${params.direccionPropiedad}`,
    html,
    attachments: ADJUNTO_LOGO,
  });
}

export async function enviarInvitacion(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  monto: string;
  linkInvitacion: string;
}) {
  const html = envoltura(
    `
    ${etiquetaSuperior("Invitación")}
    ${titulo("Configure el pago de su arriendo")}
    ${parrafo(`Estimado(a) ${params.nombreInquilino}, su arrendador le invita a registrar su método de pago para <strong>${params.direccionPropiedad}</strong>.`)}
    ${filas([
      { etiqueta: "Propiedad", valor: params.direccionPropiedad },
      { etiqueta: "Monto mensual", valor: params.monto, fuerte: true },
    ])}
    ${boton(params.linkInvitacion, "Configurar método de pago")}
  `,
    { etiqueta: "Invitación" },
  );

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Configure el pago de su arriendo — ${params.direccionPropiedad}`,
    html,
    attachments: ADJUNTO_LOGO,
  });
}

export async function enviarVerificacionIdentidad(params: {
  paraEmail: string;
  nombreInquilino: string;
  direccionPropiedad: string;
  linkVerificacion: string;
}) {
  const pasos = [
    ["1", "Foto de su cédula", "Colóquela sobre una superficie plana, con buena luz."],
    ["2", "Una selfie", "Mire de frente a la cámara."],
  ]
    .map(
      ([n, t, d]) => `
    <tr>
      <td width="40" valign="top" style="padding:10px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" width="28" height="28" style="background:${PRIMARY}; color:#ffffff; font-family:${FUENTE}; font-size:13px; font-weight:700;">${n}</td></tr></table></td>
      <td valign="top" style="padding:10px 0; font-family:${FUENTE}; font-size:14.5px; color:${INK};"><strong>${t}</strong><br><span style="font-size:13px; color:${MUTED};">${d}</span></td>
    </tr>`,
    )
    .join("");

  const html = envoltura(
    `
    ${etiquetaSuperior("Verificación de identidad")}
    ${titulo("Confirme su identidad")}
    ${parrafo(`Estimado(a) ${params.nombreInquilino}, su arrendador de <strong>${params.direccionPropiedad}</strong> le pide confirmar su identidad. Abra el enlace desde su celular: no necesita descargar nada y toma alrededor de un minuto.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL}; padding:6px 20px; border:1px solid ${BORDER};">${pasos}</table>
    ${boton(params.linkVerificacion, "Verificar mi identidad")}
    <p style="margin:16px 0 0; font-family:${FUENTE}; font-size:12.5px; color:${FAINT};">Este enlace vence en 7 días por seguridad. Sus fotos quedan protegidas y solo las ve su arrendador.</p>
  `,
    { etiqueta: "Verificación" },
  );

  return resend.emails.send({
    from: REMITENTE,
    to: params.paraEmail,
    subject: `Verifique su identidad — ${params.direccionPropiedad}`,
    html,
    attachments: ADJUNTO_LOGO,
  });
}
