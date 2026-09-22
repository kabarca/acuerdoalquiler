"use server";

import { revalidatePath } from "next/cache";
import { getArrendadorActual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWorker } from "tesseract.js";
import { avisarAdminVerificacionPendiente } from "@/lib/resend";
import { normalizarImagen } from "@/lib/normalizar-imagen";

export async function verificarIdentidadPropia(
  formData: FormData,
): Promise<{ ok: true; verificada: boolean } | { ok: false; error: string }> {
  const arrendador = await getArrendadorActual();

  const tipoDocumento = formData.get("tipoDocumento") as string;
  const numeroDocumento = formData.get("numeroDocumento") as string | null;
  const documento = formData.get("documento") as File | null;
  const selfie = formData.get("selfie") as File | null;
  const coincideRaw = formData.get("coincide") as string | null;
  const distanciaRaw = formData.get("distancia") as string | null;

  if (tipoDocumento !== "CEDULA" && tipoDocumento !== "PASAPORTE") {
    return { ok: false, error: "Indique si es cédula o pasaporte." };
  }
  if (!documento || documento.size === 0 || !selfie || selfie.size === 0) {
    return { ok: false, error: "Debe adjuntar la foto del documento y una selfie." };
  }

  const documentoNormalizado = await normalizarImagen(
    Buffer.from(await documento.arrayBuffer()),
    documento.type,
    documento.name,
  );
  const selfieNormalizada = await normalizarImagen(
    Buffer.from(await selfie.arrayBuffer()),
    selfie.type,
    selfie.name,
  );
  const documentoBytes = documentoNormalizado.buffer;
  const selfieBytes = selfieNormalizada.buffer;

  let textoExtraido = "";
  try {
    const worker = await createWorker("spa");
    const { data } = await worker.recognize(documentoBytes);
    textoExtraido = data.text.trim();
    await worker.terminate();
  } catch {
    // El OCR es un plus informativo — si falla, la verificación se guarda igual.
  }

  const coincide = coincideRaw === "true" ? true : coincideRaw === "false" ? false : null;
  const verificada = coincide === true;

  await prisma.arrendador.update({
    where: { id: arrendador.id },
    data: {
      tipoDocumentoIdentidad: tipoDocumento,
      numeroDocumentoIdentidad: numeroDocumento || null,
      documentoFotoBytes: documentoBytes,
      documentoFotoTipo: documentoNormalizado.tipo,
      selfieFotoBytes: selfieBytes,
      selfieFotoTipo: selfieNormalizada.tipo,
      textoExtraidoDocumento: textoExtraido || null,
      rostrosCoinciden: coincide,
      distanciaRostros: distanciaRaw ? Number(distanciaRaw) : null,
      identidadVerificada: verificada,
      identidadVerificadaEn: verificada ? new Date() : null,
    },
  });

  revalidatePath("/dashboard", "layout");

  if (!verificada) {
    try {
      const admins = await prisma.arrendador.findMany({
        where: { esAdmin: true },
        select: { email: true },
      });
      if (admins.length > 0) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        await avisarAdminVerificacionPendiente({
          paraEmails: admins.map((a) => a.email),
          nombreArrendador: arrendador.nombre,
          emailArrendador: arrendador.email,
          linkRevision: `${baseUrl}/admin/arrendadores/${arrendador.id}`,
        });
      }
    } catch {
      // Resend todavía no está conectado (ver Configuración) — la verificación
      // queda registrada igual, solo no se manda el aviso por correo.
    }
  }

  return { ok: true, verificada };
}
