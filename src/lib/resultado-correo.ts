// Lo que devuelven las acciones que mandan un correo desde un botón, para que
// la pantalla muestre "Correo enviado" o el motivo del fallo (ver
// components/boton-enviar-correo.tsx).
export type ResultadoCorreo = { ok: boolean; mensaje: string } | null;
