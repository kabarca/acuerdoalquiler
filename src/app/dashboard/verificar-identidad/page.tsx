import Link from "next/link";
import { redirect } from "next/navigation";
import { getArrendadorActual } from "@/lib/auth";
import { CapturaIdentidadArrendador } from "./captura-form";

export default async function VerificarIdentidadPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { next } = await searchParams;
  const continuarHref = next && next.startsWith("/") ? next : "/dashboard/propiedades/nueva";

  if (arrendador.identidadVerificada) {
    // Si venía de un flujo con destino (p. ej. "Nueva propiedad"), lo manda
    // directo ahí en vez de mostrarle un mensaje genérico de nuevo — esto
    // también cubre el caso de que la propia acción de verificar ya haya
    // refrescado esta página al quedar identidadVerificada en true.
    if (next) {
      redirect(continuarHref);
    }
    return (
      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-4 px-8 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
        </div>
        <h1 className="text-[20px] font-semibold">Su identidad ya está verificada</h1>
        <p className="text-[14px] text-ink-soft">No necesita hacer nada más.</p>
        <Link href="/dashboard/propiedades" className="text-[13.5px] font-semibold text-accent">
          Ir a Propiedades →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-8 py-10">
      <CapturaIdentidadArrendador nombreArrendador={arrendador.nombre} continuarHref={continuarHref} />
    </div>
  );
}
