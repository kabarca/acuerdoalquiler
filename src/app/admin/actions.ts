"use server";

import { revalidatePath } from "next/cache";
import { getAdminActual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// El match de rostros del lado del arrendador corre en su navegador y
// puede fallar por buena razón (mala luz, ángulo, cédula borrosa). Cuando
// eso pasa, el equipo de Rentia revisa las dos fotos a mano y lo aprueba
// aquí — es lo único que realmente lo desbloquea para registrar propiedades.
export async function verificarArrendadorManualmente(formData: FormData) {
  await getAdminActual();
  const arrendadorId = formData.get("arrendadorId") as string;

  await prisma.arrendador.update({
    where: { id: arrendadorId },
    data: { identidadVerificada: true, identidadVerificadaEn: new Date() },
  });

  revalidatePath("/admin", "layout");
}
