"use server";

import { prisma } from "@/lib/prisma";
import { after } from "next/server";
import { createWorker } from "tesseract.js";
import { normalizarImagen } from "@/lib/normalizar-imagen";

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

  const cedulaNormalizada = await normalizarImagen(
    Buffer.from(await cedula.arrayBuffer()),
    cedula.type,
    cedula.name,
  );
  const selfieNormalizada = await normalizarImagen(
    Buffer.from(await selfie.arrayBuffer()),
    selfie.type,
    selfie.name,
  );
  const cedulaBytes = cedulaNormalizada.buffer;
  const selfieBytes = selfieNormalizada.buffer;

  await prisma.verificacionIdentidad.update({
    where: { id: verificacion.id },
    data: {
      estado: "COMPLETADA",
      cedulaFotoBytes: cedulaBytes,
      cedulaFotoTipo: cedulaNormalizada.tipo,
      selfieFotoBytes: selfieBytes,
      selfieFotoTipo: selfieNormalizada.tipo,
      rostrosCoinciden: coincideRaw === "true" ? true : coincideRaw === "false" ? false : null,
      distanciaRostros: distanciaRaw ? Number(distanciaRaw) : null,
      completadoEn: new Date(),
    },
  });

  // El OCR tarda (descarga el idioma y lee la imagen) y es solo informativo:
  // se hace DESPUÉS de responder, para que el inquilino no espere. Si falla,
  // la verificación ya quedó guardada.
  after(async () => {
    try {
      // cachePath en /tmp: en Vercel el resto del disco es de solo lectura.
      const worker = await createWorker("spa", 1, { cachePath: "/tmp" });
      const { data } = await worker.recognize(cedulaBytes);
      await worker.terminate();
      const texto = data.text.trim();
      if (texto) {
        await prisma.verificacionIdentidad.update({
          where: { id: verificacion.id },
          data: { textoExtraidoCedula: texto },
        });
      }
    } catch {
      // Sin OCR la verificación sigue siendo válida.
    }
  });

  return { ok: true };
}
