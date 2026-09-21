import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Sirve la foto de cédula o selfie guardada en la base de datos. Solo el
// arrendador dueño del inquilino puede verla.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ verificacionId: string; tipo: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { verificacionId, tipo } = await params;

  if (tipo !== "cedula" && tipo !== "selfie") {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const verificacion = await prisma.verificacionIdentidad.findFirst({
    where: {
      id: verificacionId,
      inquilino: { propiedad: { arrendador: { supabaseUserId: user.id } } },
    },
  });

  const bytes = tipo === "cedula" ? verificacion?.cedulaFotoBytes : verificacion?.selfieFotoBytes;
  const contentType = tipo === "cedula" ? verificacion?.cedulaFotoTipo : verificacion?.selfieFotoTipo;

  if (!verificacion || !bytes) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType ?? "image/jpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
