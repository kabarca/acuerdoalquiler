import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Sirve el comprobante de transferencia guardado en la base de datos.
// Solo el arrendador dueño de la propiedad puede verlo.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ facturaId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { facturaId } = await params;

  const factura = await prisma.factura.findFirst({
    where: {
      id: facturaId,
      inquilino: { propiedad: { arrendador: { supabaseUserId: user.id } } },
    },
  });

  if (!factura || !factura.comprobanteBytes) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  return new NextResponse(new Uint8Array(factura.comprobanteBytes), {
    headers: {
      "Content-Type": factura.comprobanteTipo ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${factura.comprobanteNombre ?? "comprobante"}"`,
    },
  });
}
