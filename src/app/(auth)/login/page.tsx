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
    <div className="w-full max-w-[420px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-semibold">Iniciar sesión</h1>
        <p className="text-[15px] text-ink-soft">Entre a su panel de arrendador.</p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <form action={login} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">Correo electrónico</label>
          <input
            name="email"
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-[10px] bg-primary py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Entrar
        </button>

        <p className="text-center text-sm text-ink-soft">
          ¿Todavía no tiene cuenta?{" "}
          <Link href="/registro" className="font-semibold text-accent">
            Regístrese
          </Link>
        </p>
      </form>
    </div>
  );
}
