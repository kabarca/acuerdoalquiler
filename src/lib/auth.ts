import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
