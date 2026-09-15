import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function registrar(formData: FormData) {
  "use server";

  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect(`/registro?error=${encodeURIComponent(error?.message ?? "No se pudo crear la cuenta")}`);
  }

  await prisma.arrendador.create({
    data: {
      supabaseUserId: data.user.id,
      nombre,
      email,
    },
  });

  redirect("/dashboard");
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-xl font-semibold">Crear cuenta de arrendador</h1>
      <p className="mt-1 text-sm text-muted">
        Regístrate para empezar a cobrar el alquiler con tarjeta.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={registrar} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Nombre
          <input
            name="nombre"
            type="text"
            required
            className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Correo
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Contraseña
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
        >
          Crear cuenta
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
