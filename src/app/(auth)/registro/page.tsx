import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function registrar(formData: FormData) {
  "use server";

  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmar = formData.get("confirmar") as string;

  if (password !== confirmar) {
    redirect(`/registro?error=${encodeURIComponent("Las contraseñas no coinciden")}`);
  }

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
    <div className="w-full max-w-[420px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-semibold">Cree su cuenta de arrendador</h1>
        <p className="text-[15px] text-ink-soft">
          Gestione sus propiedades y cobre el arriendo por transferencia bancaria.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <form action={registrar} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">Nombre completo</label>
          <input
            name="nombre"
            type="text"
            required
            placeholder="Ej. Mariana Solís"
            className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
          />
        </div>
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
        <div className="flex gap-3.5">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Confirmar contraseña</label>
            <input
              name="confirmar"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
            />
          </div>
        </div>

        <label className="mt-1 flex items-start gap-2.5">
          <input type="checkbox" required className="mt-1 h-[18px] w-[18px] shrink-0 rounded-[5px] border-[1.5px] border-border accent-primary" />
          <span className="text-[13px] leading-relaxed text-ink-soft">
            Acepto los <span className="font-semibold text-accent">Términos de servicio</span> y la{" "}
            <span className="font-semibold text-accent">Política de privacidad</span> de Acuerdo Alquiler.
          </span>
        </label>

        <button
          type="submit"
          className="mt-2 w-full rounded-[10px] bg-primary py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Crear cuenta
        </button>

        <p className="text-center text-sm text-ink-soft">
          ¿Ya tiene una cuenta?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Inicie sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
