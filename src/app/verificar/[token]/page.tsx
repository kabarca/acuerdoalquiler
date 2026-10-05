import { prisma } from "@/lib/prisma";
import { CapturaForm } from "./captura-form";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
      </div>
      <span className="font-heading text-base font-bold">Rentia</span>
    </div>
  );
}

function Mensaje({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-4 rounded-[18px] border border-border bg-surface p-9 text-center shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
        <Logo />
        <h1 className="mt-2 text-[19px] font-semibold">{titulo}</h1>
        <p className="text-[14px] leading-relaxed text-ink-soft">{texto}</p>
      </div>
    </div>
  );
}

export default async function VerificarPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ previa?: string }>;
}) {
  const { token } = await params;
  // ?previa=1 deja al arrendador recorrer las pantallas tal como las ve el
  // inquilino, sin enviar nada de verdad.
  const { previa } = await searchParams;

  const verificacion = await prisma.verificacionIdentidad.findUnique({
    where: { token },
    include: { inquilino: { include: { propiedad: true } } },
  });

  if (!verificacion) {
    return (
      <Mensaje
        titulo="Enlace inválido"
        texto="Este enlace de verificación no existe. Pídale a su arrendador que le envíe uno nuevo."
      />
    );
  }

  if (verificacion.estado === "COMPLETADA") {
    return (
      <Mensaje
        titulo="Ya completó su verificación"
        texto="Su arrendador ya recibió su cédula y selfie. No necesita hacer nada más."
      />
    );
  }

  if (verificacion.tokenExpiraEn < new Date()) {
    return (
      <Mensaje
        titulo="Este enlace venció"
        texto="Por seguridad, los enlaces de verificación vencen después de 7 días. Pídale a su arrendador que le envíe uno nuevo."
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-10">
      <div className="mx-auto flex max-w-[480px] flex-col gap-5">
        <Logo />
        <CapturaForm
          token={token}
          nombreInquilino={verificacion.inquilino.nombre}
          direccionPropiedad={verificacion.inquilino.propiedad.direccion}
          soloVista={previa === "1"}
        />
      </div>
    </div>
  );
}
