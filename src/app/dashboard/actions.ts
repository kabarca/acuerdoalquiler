"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { enviarInvitacion, enviarVerificacionIdentidad as enviarVerificacionIdentidadEmail } from "@/lib/resend";

function revalidarPanel() {
  revalidatePath("/dashboard", "layout");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function fechaOpcional(formData: FormData, campo: string) {
  const valor = formData.get(campo) as string;
  return valor ? new Date(valor) : null;
}

// Un solo formulario registra la propiedad, el inquilino y las condiciones
// de pago a la vez — como en la pantalla "Registrar propiedad e inquilino".
export async function crearPropiedadConInquilino(formData: FormData) {
  const arrendador = await getArrendadorActual();

  if (!arrendador.identidadVerificada) {
    redirect("/dashboard/verificar-identidad?next=/dashboard/propiedades/nueva");
  }

  const direccion = formData.get("direccion") as string;
  const tipo = formData.get("tipo") as string;
  const canton = formData.get("canton") as string;
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const telefono = formData.get("telefono") as string;
  const montoRenta = formData.get("montoRenta") as string;
  const diaCobro = Number(formData.get("diaCobro"));

  const propiedad = await prisma.propiedad.create({
    data: {
      arrendadorId: arrendador.id,
      direccion,
      tipo: tipo as "APARTAMENTO" | "CASA" | "LOCAL_COMERCIAL",
      canton: canton || null,
    },
  });

  await prisma.inquilino.create({
    data: {
      propiedadId: propiedad.id,
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
  redirect(`/dashboard/propiedades/${propiedad.id}`);
}

export async function crearInquilino(formData: FormData) {
  await getArrendadorActual();

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

export async function eliminarPropiedad(formData: FormData) {
  const arrendador = await getArrendadorActual();
  const propiedadId = formData.get("propiedadId") as string;

  await prisma.propiedad.deleteMany({
    where: { id: propiedadId, arrendadorId: arrendador.id },
  });

  redirect("/dashboard/propiedades");
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

// Quita al inquilino con un motivo (ver RemoveTenantFeedback). Se conserva
// la fila (activo=false) en vez de borrarla, para que su historial siga
// contando en la reputación que ven otros arrendadores.
export async function quitarInquilino(formData: FormData) {
  await getArrendadorActual();

  const inquilinoId = formData.get("inquilinoId") as string;
  const propiedadId = formData.get("propiedadId") as string;
  const motivoSalida = formData.get("motivoSalida") as string;
  const notaSalida = formData.get("notaSalida") as string;

  const inquilino = await prisma.inquilino.findUniqueOrThrow({ where: { id: inquilinoId } });

  await prisma.inquilino.update({
    where: { id: inquilinoId },
    data: {
      activo: false,
      fechaFinContrato: inquilino.fechaFinContrato ?? new Date(),
      motivoSalida: motivoSalida || null,
      notaSalida: notaSalida || null,
    },
  });

  revalidarPanel();
  redirect(`/dashboard/propiedades/${propiedadId}`);
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

// Botón de prueba: marca la factura del mes como atrasada sin esperar al
// cron, para poder probar el flujo de disputa.
export async function marcarFacturaAtrasadaDePrueba(formData: FormData) {
  await getArrendadorActual();
  const facturaId = formData.get("facturaId") as string;

  await prisma.factura.update({
    where: { id: facturaId },
    data: { estado: "ATRASADA" },
  });

  revalidarPanel();
}

export async function invitarInquilino(formData: FormData) {
  const arrendador = await getArrendadorActual();

  const propiedadId = formData.get("propiedadId") as string;
  const email = formData.get("email") as string;
  const montoRenta = formData.get("montoRenta") as string;
  const diaCobro = Number(formData.get("diaCobro"));

  const propiedad = await prisma.propiedad.findFirstOrThrow({
    where: { id: propiedadId, arrendadorId: arrendador.id },
    include: { inquilinos: { where: { activo: true } } },
  });

  const inquilino = propiedad.inquilinos[0];
  if (!inquilino) {
    throw new Error("Esta propiedad todavía no tiene inquilino — regístrelo primero.");
  }

  const actualizado = await prisma.inquilino.update({
    where: { id: inquilino.id },
    data: { email, montoRenta, diaCobro, invitacionEnviadaEn: new Date() },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    await enviarInvitacion({
      paraEmail: actualizado.email,
      nombreInquilino: actualizado.nombre,
      direccionPropiedad: propiedad.direccion,
      monto: Number(actualizado.montoRenta).toLocaleString("es-CR"),
      linkInvitacion: `${baseUrl}/invitacion/${actualizado.id}`,
    });
  } catch {
    // Resend todavía no está conectado (ver Configuración) — la invitación
    // queda registrada y el link funciona igual, solo no se manda el correo.
  }

  revalidarPanel();
  redirect(`/dashboard/propiedades/${propiedadId}`);
}

export async function enviarVerificacionIdentidad(formData: FormData) {
  const arrendador = await getArrendadorActual();
  const propiedadId = formData.get("propiedadId") as string;

  const propiedad = await prisma.propiedad.findFirstOrThrow({
    where: { id: propiedadId, arrendadorId: arrendador.id },
    include: { inquilinos: { where: { activo: true } } },
  });

  const inquilino = propiedad.inquilinos[0];
  if (!inquilino) {
    throw new Error("Esta propiedad todavía no tiene inquilino — regístrelo primero.");
  }

  const token = randomBytes(24).toString("hex");
  const tokenExpiraEn = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.verificacionIdentidad.upsert({
    where: { inquilinoId: inquilino.id },
    create: { inquilinoId: inquilino.id, token, tokenExpiraEn, enviadoEn: new Date() },
    update: {
      token,
      tokenExpiraEn,
      estado: "PENDIENTE",
      enviadoEn: new Date(),
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

  try {
    await enviarVerificacionIdentidadEmail({
      paraEmail: inquilino.email,
      nombreInquilino: inquilino.nombre,
      direccionPropiedad: propiedad.direccion,
      linkVerificacion: `${baseUrl}/verificar/${token}`,
    });
  } catch {
    // Resend todavía no está conectado (ver Configuración) — la verificación
    // queda registrada y el link funciona igual, solo no se manda el correo.
  }

  revalidarPanel();
  redirect(`/dashboard/propiedades/${propiedadId}`);
}

export async function abrirDisputaDePrueba(formData: FormData) {
  await getArrendadorActual();
  const facturaId = formData.get("facturaId") as string;

  const factura = await prisma.factura.findUniqueOrThrow({
    where: { id: facturaId },
    include: { inquilino: true },
  });

  const dias = Math.max(
    1,
    Math.round((Date.now() - factura.fechaVencimiento.getTime()) / 86_400_000),
  );

  await prisma.disputa.upsert({
    where: { facturaId },
    update: {},
    create: {
      facturaId,
      inquilinoId: factura.inquilinoId,
      motivoApertura: `Venció el pago de ${factura.periodo} sin registrarse. Han transcurrido ${dias} día(s) desde la fecha de vencimiento.`,
    },
  });

  revalidarPanel();
}

export async function registrarRespuestaInquilino(formData: FormData) {
  await getArrendadorActual();
  const disputaId = formData.get("disputaId") as string;
  const respuesta = formData.get("respuestaInquilino") as string;

  await prisma.disputa.update({
    where: { id: disputaId },
    data: { respuestaInquilino: respuesta, fechaRespuesta: new Date() },
  });

  revalidarPanel();
}

export async function otorgarProrroga(formData: FormData) {
  await getArrendadorActual();

  const disputaId = formData.get("disputaId") as string;
  const nuevaFechaVencimiento = new Date(formData.get("nuevaFechaVencimiento") as string);
  const nota = formData.get("nota") as string;

  const disputa = await prisma.disputa.findUniqueOrThrow({ where: { id: disputaId } });

  await prisma.$transaction([
    prisma.disputa.update({
      where: { id: disputaId },
      data: {
        estado: "RESUELTA",
        resolucion: "PRORROGA",
        motivoResolucion: nota || null,
        nuevaFechaVencimiento,
        fechaResolucion: new Date(),
      },
    }),
    prisma.factura.update({
      where: { id: disputa.facturaId },
      data: { estado: "PENDIENTE", fechaVencimiento: nuevaFechaVencimiento },
    }),
  ]);

  revalidarPanel();
  redirect(`/dashboard/disputas/${disputaId}`);
}

export async function marcarMoroso(formData: FormData) {
  await getArrendadorActual();

  const disputaId = formData.get("disputaId") as string;
  const motivo = formData.get("motivo") as string;

  await prisma.disputa.update({
    where: { id: disputaId },
    data: {
      estado: "RESUELTA",
      resolucion: "MOROSO",
      motivoResolucion: motivo,
      fechaResolucion: new Date(),
    },
  });

  revalidarPanel();
  redirect(`/dashboard/disputas/${disputaId}`);
}

export async function confirmarComprobante(formData: FormData) {
  await getArrendadorActual();
  const facturaId = formData.get("facturaId") as string;

  await prisma.factura.update({
    where: { id: facturaId },
    data: { estado: "PAGADA", pagadoEn: new Date(), metodoPago: "TRANSFERENCIA" },
  });

  revalidarPanel();
}

export async function rechazarComprobante(formData: FormData) {
  await getArrendadorActual();
  const facturaId = formData.get("facturaId") as string;

  await prisma.factura.update({
    where: { id: facturaId },
    data: {
      estado: "ATRASADA",
      comprobanteBytes: null,
      comprobanteTipo: null,
      comprobanteNombre: null,
      comprobanteSubidoEn: null,
    },
  });

  revalidarPanel();
}

export async function actualizarDatosBancarios(formData: FormData) {
  const arrendador = await getArrendadorActual();

  const tipoCuentaBancaria =
    (formData.get("tipoCuentaBancaria") as string) === "INTERNACIONAL"
      ? "INTERNACIONAL"
      : "NACIONAL";
  const internacional = tipoCuentaBancaria === "INTERNACIONAL";

  await prisma.arrendador.update({
    where: { id: arrendador.id },
    data: {
      tipoCuentaBancaria,
      banco: (formData.get("banco") as string) || null,
      cuentaIban: (formData.get("cuentaIban") as string) || null,
      titularCuenta: (formData.get("titularCuenta") as string) || null,
      // Los campos de wire internacional se limpian si vuelve a NACIONAL,
      // para no dejar datos viejos sin usar.
      swiftBic: internacional ? (formData.get("swiftBic") as string) || null : null,
      paisBanco: internacional ? (formData.get("paisBanco") as string) || null : null,
      direccionBanco: internacional ? (formData.get("direccionBanco") as string) || null : null,
      direccionTitular: internacional ? (formData.get("direccionTitular") as string) || null : null,
      numeroRuta: internacional ? (formData.get("numeroRuta") as string) || null : null,
    },
  });

  revalidarPanel();
}
