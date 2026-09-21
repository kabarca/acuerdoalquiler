"use server";

import { prisma } from "@/lib/prisma";
import { createWorker } from "tesseract.js";

export async function procesarVerificacion(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = formData.get("token") as string;
  const cedula = formData.get("cedula") as File | null;
  const selfie = formData.get("selfie") as File | null;
  const coincideRaw = formData.get("coincide") as string | null;
  const distanciaRaw = formData.get("distancia") as string | null;

  if (!token) {
    return { ok: false, error: "Enlace inválido." };
  }

  const verificacion = await prisma.verificacionIdentidad.findUnique({ where: { token } });

  if (!verificacion) {
    return { ok: false, error: "Enlace inválido." };
  }
  if (verificacion.estado === "COMPLETADA") {
    return { ok: false, error: "Esta verificación ya fue completada." };
  }
  if (verificacion.tokenExpiraEn < new Date()) {
    await prisma.verificacionIdentidad.update({
      where: { id: verificacion.id },
      data: { estado: "EXPIRADA" },
    });
    return { ok: false, error: "Este enlace venció. Pídale a su arrendador que le envíe uno nuevo." };
  }
  if (!cedula || cedula.size === 0 || !selfie || selfie.size === 0) {
    return { ok: false, error: "Debe adjuntar la foto de su cédula y una selfie." };
  }

  const cedulaBytes = Buffer.from(await cedula.arrayBuffer());
  const selfieBytes = Buffer.from(await selfie.arrayBuffer());

  let textoExtraido = "";
  try {
    const worker = await createWorker("spa");
    const { data } = await worker.recognize(cedulaBytes);
    textoExtraido = data.text.trim();
    await worker.terminate();
  } catch {
    // El OCR es un plus informativo — si falla, la verificación se guarda igual.
  }

  await prisma.verificacionIdentidad.update({
    where: { id: verificacion.id },
    data: {
      estado: "COMPLETADA",
      cedulaFotoBytes: cedulaBytes,
      cedulaFotoTipo: cedula.type || "image/jpeg",
      selfieFotoBytes: selfieBytes,
      selfieFotoTipo: selfie.type || "image/jpeg",
      textoExtraidoCedula: textoExtraido || null,
      rostrosCoinciden: coincideRaw === "true" ? true : coincideRaw === "false" ? false : null,
      distanciaRostros: distanciaRaw ? Number(distanciaRaw) : null,
      completadoEn: new Date(),
    },
  });

  return { ok: true };
}
