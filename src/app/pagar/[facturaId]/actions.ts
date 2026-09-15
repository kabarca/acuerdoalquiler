"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function subirComprobante(formData: FormData) {
  const facturaId = formData.get("facturaId") as string;
  const archivo = formData.get("comprobante") as File;

  if (!archivo || archivo.size === 0) {
    redirect(`/pagar/${facturaId}?metodo=transferencia&error=falta-archivo`);
  }

  const bytes = Buffer.from(await archivo.arrayBuffer());

  await prisma.factura.update({
    where: { id: facturaId },
    data: {
      estado: "EN_REVISION",
      metodoPago: "TRANSFERENCIA",
      comprobanteBytes: bytes,
      comprobanteTipo: archivo.type || "application/octet-stream",
      comprobanteNombre: archivo.name,
      comprobanteSubidoEn: new Date(),
    },
  });

  redirect(`/pagar/${facturaId}`);
}
