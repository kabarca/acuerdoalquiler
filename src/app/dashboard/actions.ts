"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function revalidarPanel() {
  revalidatePath("/dashboard", "layout");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function crearPropiedad(formData: FormData) {
  const arrendador = await getArrendadorActual();
  const direccion = formData.get("direccion") as string;

  await prisma.propiedad.create({
    data: { arrendadorId: arrendador.id, direccion },
  });

  revalidarPanel();
}

export async function eliminarPropiedad(formData: FormData) {
  const arrendador = await getArrendadorActual();
  const propiedadId = formData.get("propiedadId") as string;

  await prisma.propiedad.deleteMany({
    where: { id: propiedadId, arrendadorId: arrendador.id },
  });

  redirect("/dashboard");
}

function fechaOpcional(formData: FormData, campo: string) {
  const valor = formData.get(campo) as string;
  return valor ? new Date(valor) : null;
}

export async function crearInquilino(formData: FormData) {
  await getArrendadorActual(); // valida sesión; la propiedad ya confirma dueño abajo

  const propiedadId = formData.get("propiedadId") as string;
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const telefono = formData.get("telefono") as string;
  const montoRenta = formData.get("montoRenta") as string;
  const diaCobro = Number(formData.get("diaCobro"));

  await prisma.inquilino.create({
    data: {
      propiedadId,
      nombre,
      email,
      telefono: telefono || null,
      montoRenta,
      diaCobro,
      fechaInicioContrato: fechaOpcional(formData, "fechaInicioContrato"),
      fechaFinContrato: fechaOpcional(formData, "fechaFinContrato"),
    },
  });

  revalidarPanel();
}

export async function actualizarInquilino(formData: FormData) {
  await getArrendadorActual();

  const inquilinoId = formData.get("inquilinoId") as string;
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const telefono = formData.get("telefono") as string;
  const montoRenta = formData.get("montoRenta") as string;
  const diaCobro = Number(formData.get("diaCobro"));

  await prisma.inquilino.update({
    where: { id: inquilinoId },
    data: {
      nombre,
      email,
      telefono: telefono || null,
      montoRenta,
      diaCobro,
      fechaInicioContrato: fechaOpcional(formData, "fechaInicioContrato"),
      fechaFinContrato: fechaOpcional(formData, "fechaFinContrato"),
    },
  });

  revalidarPanel();
}

export async function eliminarInquilino(formData: FormData) {
  await getArrendadorActual();
  const inquilinoId = formData.get("inquilinoId") as string;

  await prisma.inquilino.delete({ where: { id: inquilinoId } });

  revalidarPanel();
}

// Genera (o regenera) la factura del mes actual para un inquilino, sin
// esperar al cron. Pensado para probar el flujo completo mientras no
// existe todavía la generación automática ni la cuenta real de Onvopay.
export async function generarFacturaDePrueba(formData: FormData) {
  await getArrendadorActual();

  const inquilinoId = formData.get("inquilinoId") as string;
  const inquilino = await prisma.inquilino.findUniqueOrThrow({
    where: { id: inquilinoId },
  });

  const ahora = new Date();
  const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  const fechaVencimiento = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    inquilino.diaCobro,
  );

  await prisma.factura.upsert({
    where: { inquilinoId_periodo: { inquilinoId, periodo } },
    update: {},
    create: {
      inquilinoId,
      periodo,
      monto: inquilino.montoRenta,
      fechaVencimiento,
    },
  });

  revalidarPanel();
}
