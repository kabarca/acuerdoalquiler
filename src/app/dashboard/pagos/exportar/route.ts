import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function csvEscape(valor: string) {
  return `"${valor.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const facturas = await prisma.factura.findMany({
    where: { inquilino: { propiedad: { arrendador: { supabaseUserId: user.id } } } },
    include: { inquilino: { include: { propiedad: true } } },
    orderBy: { creadoEn: "desc" },
  });

  const encabezado = [
    "Fecha",
    "Propiedad",
    "Inquilino",
    "Periodo",
    "Monto",
    "Moneda",
    "Metodo",
    "Estado",
  ];

  const filas = facturas.map((f) =>
    [
      (f.pagadoEn ?? f.creadoEn).toISOString().slice(0, 10),
      f.inquilino.propiedad.direccion,
      f.inquilino.nombre,
      f.periodo,
      Number(f.monto).toString(),
      f.moneda,
      f.metodoPago ?? "",
      f.estado,
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );

  const csv = [encabezado.map(csvEscape).join(","), ...filas].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pagos-acuerdo-alquiler.csv"`,
    },
  });
}
