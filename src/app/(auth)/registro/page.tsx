import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { siguientePaso } from "@/lib/auth";

async function registrar(formData: FormData) {
  "use server";

  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmar = formData.get("confirmar") as string;
  const next = siguientePaso(formData.get("next") as string | undefined);

  if (password !== confirmar) {
    redirect(`/registro?error=${encodeURIComponent("Las contraseñas no coinciden")}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect(`/registro?error=${encodeURIComponent(error?.message ?? "No se pudo crear la cuenta")}&next=${encodeURIComponent(next)}`);
  }

  await prisma.arrendador.create({
    data: {
      supabaseUserId: data.user.id,
      nombre,
      email,
    },
  });

  redirect(next);
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  const inputClass =
    "w-full rounded-[3px] border border-public-border px-3.5 py-3 text-[15px] text-public-body outline-none focus:border-public-primary";

  return (
    <div className="w-full max-w-[420px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-light text-public-ink">Cree su cuenta de arrendador</h1>
        <p className="text-[15px] text-public-muted">
          Gestione sus propiedades y cobre el arriendo por transferencia bancaria.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-[3px] border border-danger bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <form action={registrar} className="mt-6 flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-public-body">Nombre completo</label>
          <input
            name="nombre"
            type="text"
            required
            placeholder="Ej. Mariana Solís"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-public-body">Correo electrónico</label>
          <input
            name="email"
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            className={inputClass}
          />
        </div>
        <div className="flex gap-3.5">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-public-body">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-public-body">Confirmar contraseña</label>
            <input
              name="confirmar"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
        </div>

        <label className="mt-1 flex items-start gap-2.5">
          <input type="checkbox" required className="mt-1 h-[18px] w-[18px] shrink-0 rounded-[3px] border border-public-border accent-public-primary" />
          <span className="text-[13px] leading-relaxed text-public-muted">
            Acepto los <span className="font-semibold text-public-primary">Términos de servicio</span> y la{" "}
            <span className="font-semibold text-public-primary">Política de privacidad</span> de Acuerdo Alquiler.
          </span>
        </label>

        <button
          type="submit"
          className="mt-2 w-full rounded-[3px] bg-public-primary py-3.5 text-[13px] font-bold tracking-[0.15em] text-white uppercase transition-colors hover:bg-public-ink"
        >
          Crear cuenta
        </button>

        <p className="text-center text-sm text-public-muted">
          ¿Ya tiene una cuenta?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-semibold text-public-primary"
          >
            Inicie sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
