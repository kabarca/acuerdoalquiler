import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Valida el parámetro ?next= que /registro y /login usan para retomar el
// flujo de inicio rápido (ver CLAUDE.md) — solo rutas propias relativas
// ("/algo"), nunca "//algo" (protocol-relative) ni una URL absoluta, para no
// abrir un open redirect. Si no es segura, cae a /dashboard como siempre.
export function siguientePaso(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

// Devuelve el Arrendador (fila de nuestra base) dueño de la sesión activa,
// o redirige a /login si no hay sesión.
export async function getArrendadorActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const arrendador = await prisma.arrendador.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!arrendador) {
    redirect("/login");
  }

  return arrendador;
}

// Igual que getArrendadorActual(), pero además exige esAdmin — usado por
// /admin, el panel interno del equipo de Acuerdo Alquiler (ver CLAUDE.md).
export async function getAdminActual() {
  const arrendador = await getArrendadorActual();

  if (!arrendador.esAdmin) {
    redirect("/dashboard");
  }

  return arrendador;
}
