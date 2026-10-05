import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { enviarVerificacionIdentidad, intentarEnvio } from "@/lib/resend";

export const DIAS_VIGENCIA_ENLACE = 7;

// Crea (o renueva) el enlace de verificación de identidad de un inquilino e
// intenta mandárselo por correo. Se llama solo al registrar al inquilino y
// también desde el botón "Reenviar enlace". Si el correo no puede salir (p. ej.
// Resend sin configurar), el enlace existe igual y la propiedad lo muestra
// para que el arrendador se lo pase por otro medio.
export async function crearYEnviarVerificacion(inquilinoId: string) {
  const inquilino = await prisma.inquilino.findUniqueOrThrow({
    where: { id: inquilinoId },
    include: { propiedad: true },
  });

  const token = randomBytes(24).toString("hex");
  const tokenExpiraEn = new Date(Date.now() + DIAS_VIGENCIA_ENLACE * 24 * 60 * 60 * 1000);

  await prisma.verificacionIdentidad.upsert({
    where: { inquilinoId },
    create: { inquilinoId, token, tokenExpiraEn, enviadoEn: new Date() },
    update: {
      token,
      tokenExpiraEn,
      estado: "PENDIENTE",
      enviadoEn: new Date(),
      correoEnviadoEn: null,
      errorEnvio: null,
      completadoEn: null,
      cedulaFotoBytes: null,
      cedulaFotoTipo: null,
      selfieFotoBytes: null,
      selfieFotoTipo: null,
      textoExtraidoCedula: null,
      rostrosCoinciden: null,
      distanciaRostros: null,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resultado = await intentarEnvio(() =>
    enviarVerificacionIdentidad({
      paraEmail: inquilino.email,
      nombreInquilino: inquilino.nombre,
      direccionPropiedad: inquilino.propiedad.direccion,
      linkVerificacion: `${baseUrl}/verificar/${token}`,
    }),
  );

  await prisma.verificacionIdentidad.update({
    where: { inquilinoId },
    data: resultado.ok
      ? { correoEnviadoEn: new Date(), errorEnvio: null }
      : { errorEnvio: resultado.error },
  });

  return resultado;
}
