import { formatearMonto } from "@/lib/moneda";
import { SelectorFecha } from "@/components/selector-fecha";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { otorgarProrroga } from "../../../actions";

function aInputDate(fecha: Date) {
  return fecha.toISOString().slice(0, 10);
}

export default async function ProrrogaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;

  const disputa = await prisma.disputa.findFirst({
    where: { id, inquilino: { propiedad: { arrendadorId: arrendador.id } }, estado: "ABIERTA" },
    include: { factura: true, inquilino: true },
  });

  if (!disputa) {
    notFound();
  }

  const primerNombre = disputa.inquilino.nombre.split(" ")[0];
  const sugerida = new Date(disputa.factura.fechaVencimiento);
  sugerida.setDate(sugerida.getDate() + 14);

  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-[560px] rounded-[18px] border border-border bg-surface p-8 shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-light">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
          </div>
          <div>
            <h1 className="text-[19px] font-semibold">Otorgar prórroga a {primerNombre}</h1>
            <p className="mt-1 text-[13.5px] text-ink-soft">
              Venció el {disputa.factura.fechaVencimiento.toLocaleDateString("es-CR", { day: "numeric", month: "long" })} ·{" "}
              {formatearMonto(disputa.factura.monto, disputa.factura.moneda)} pendientes
            </p>
          </div>
        </div>

        <form action={otorgarProrroga} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="disputaId" value={disputa.id} />

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Nueva fecha límite</label>
            <SelectorFecha name="nuevaFechaVencimiento" defaultValue={aInputDate(sugerida)} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">
              Nota para {primerNombre} (opcional)
            </label>
            <textarea
              name="nota"
              rows={3}
              placeholder="Ej. Con gusto le doy dos semanas más. Avíseme si necesita algo."
              className="w-full resize-none rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
            />
          </div>

          <p className="rounded-[10px] bg-bg p-3.5 text-[13px] leading-relaxed text-ink-soft">
            La disputa se cerrará automáticamente si {primerNombre} completa el pago antes de la
            nueva fecha. Si no paga, podrá tomar otra decisión.
          </p>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/disputas/${disputa.id}`}
              className="flex-1 rounded-[10px] border-[1.5px] border-border py-3 text-center text-[14.5px] font-semibold text-ink-soft"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-[1.4] rounded-[10px] bg-primary py-3 text-[14.5px] font-bold text-white hover:bg-primary-dark"
            >
              Otorgar prórroga y notificar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
