import { NextResponse } from "next/server";
import { procesarFacturacionAutomatica } from "@/lib/facturacion";

// Lo llama Vercel Cron una vez al día (ver vercel.json). Vercel manda el
// header Authorization: Bearer <CRON_SECRET> cuando CRON_SECRET está definido
// en las variables de entorno del proyecto.
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;

  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const resultado = await procesarFacturacionAutomatica();
  return NextResponse.json(resultado);
}
