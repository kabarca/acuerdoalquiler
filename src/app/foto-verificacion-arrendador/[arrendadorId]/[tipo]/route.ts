import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Sirve la foto de documento o selfie de un ARRENDADOR (no de un inquilino
// — ver /foto-verificacion para esa). Solo el equipo de Rentia (esAdmin)
// puede verla, ya que un arrendador nunca revisa la identidad de otro.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ arrendadorId: string; tipo: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const solicitante = await prisma.arrendador.findUnique({ where: { supabaseUserId: user.id } });
  if (!solicitante?.esAdmin) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { arrendadorId, tipo } = await params;

  if (tipo !== "documento" && tipo !== "selfie") {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const arrendador = await prisma.arrendador.findUnique({ where: { id: arrendadorId } });

  const bytes = tipo === "documento" ? arrendador?.documentoFotoBytes : arrendador?.selfieFotoBytes;
  const contentType = tipo === "documento" ? arrendador?.documentoFotoTipo : arrendador?.selfieFotoTipo;

  if (!arrendador || !bytes) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType ?? "image/jpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
