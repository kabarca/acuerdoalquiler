"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function confirmarMetodoPago(formData: FormData) {
  const inquilinoId = formData.get("inquilinoId") as string;
  const metodoPagoPreferido = formData.get("metodoPagoPreferido") as
    | "TRANSFERENCIA"
    | "DEBITO"
    | "CREDITO";
  const cedula = formData.get("cedula") as string;
  const compartirHistorial = formData.get("compartirHistorial") === "on";

  await prisma.inquilino.update({
    where: { id: inquilinoId },
    data: {
      metodoPagoPreferido,
      cedula: cedula || null,
      compartirHistorial,
    },
  });

  redirect(`/invitacion/${inquilinoId}?confirmado=1`);
}
