import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { marcarMoroso } from "../../../actions";

export default async function MarcarMorosoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;

  const disputa = await prisma.disputa.findFirst({
    where: { id, inquilino: { propiedad: { arrendadorId: arrendador.id } }, estado: "ABIERTA" },
    include: { factura: true, inquilino: { include: { propiedad: true } } },
  });

  if (!disputa) {
    notFound();
  }

  const primerNombre = disputa.inquilino.nombre.split(" ")[0];

  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-[560px] rounded-[18px] border border-border bg-surface p-8 shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-danger-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12.5"/><line x1="12" y1="15.5" x2="12" y2="15.6"/></svg>
          </div>
          <div>
            <h1 className="text-[19px] font-semibold">Marcar a {primerNombre} como moroso(a)</h1>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
              Propiedad: {disputa.inquilino.propiedad.direccion} · Monto pendiente: ₡
              {Number(disputa.factura.monto).toLocaleString("es-CR")}
            </p>
          </div>
        </div>

        <div className="mt-4.5 rounded-[10px] bg-danger-bg p-3.5 text-[13px] leading-relaxed font-semibold text-danger">
          Esta acción quedará registrada en el historial de reputación de {primerNombre} y será
          visible para otros arrendadores en Rentia. No se puede deshacer sin abrir una nueva
          revisión.
        </div>

        <form action={marcarMoroso} className="mt-4.5 flex flex-col gap-4">
          <input type="hidden" name="disputaId" value={disputa.id} />

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Motivo (obligatorio)</label>
            <textarea
              name="motivo"
              required
              rows={4}
              placeholder={`Ej. No ha realizado el pago de ${disputa.factura.periodo} ni respondido a los recordatorios ni a la solicitud de prórroga.`}
              className="w-full resize-none rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[14.5px] outline-none focus:border-primary"
            />
          </div>

          <label className="flex items-start gap-2.5">
            <input type="checkbox" required className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-primary" />
            <span className="text-[13px] leading-relaxed text-ink-soft">
              Confirmo que esta información es verídica y que intenté resolver la situación
              directamente con {primerNombre} antes de esta acción.
            </span>
          </label>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/disputas/${disputa.id}`}
              className="flex-1 rounded-[10px] border-[1.5px] border-border py-3 text-center text-[14.5px] font-semibold text-ink-soft"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-[1.4] rounded-[10px] bg-danger py-3 text-[14.5px] font-bold text-white"
            >
              Marcar como moroso(a)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
