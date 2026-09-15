import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function login(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-xl font-semibold">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-muted">Entra a tu panel de arrendador.</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={login} className="mt-6 flex flex-col gap-4">
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
            className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Todavía no tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
