import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { confirmarComprobante, rechazarComprobante } from "../../../actions";

export default async function ConfirmarPagoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;

  const factura = await prisma.factura.findFirst({
    where: { id, inquilino: { propiedad: { arrendadorId: arrendador.id } } },
    include: { inquilino: { include: { propiedad: true } } },
  });

  if (!factura || factura.estado !== "EN_REVISION") {
    notFound();
  }

  const { inquilino } = factura;
  const primerNombre = inquilino.nombre.split(" ")[0];
  const kb = factura.comprobanteBytes ? Math.round(factura.comprobanteBytes.length / 1024) : 0;

  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-[560px] overflow-hidden rounded-[18px] border border-border bg-surface shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
        <div className="flex items-center justify-between border-b border-border px-8 py-6.5">
          <div>
            <span className="text-[12.5px] font-bold text-warning">COMPROBANTE RECIBIDO</span>
            <h1 className="mt-0.5 text-[19px] font-semibold">Confirmar pago de {primerNombre}</h1>
          </div>
          <span className="rounded-full bg-warning-bg px-3 py-1.5 text-xs font-bold text-warning">
            Pendiente de confirmación
          </span>
        </div>

        <div className="flex flex-col gap-5 px-8 py-7">
          <div className="flex flex-col gap-2 rounded-[10px] bg-bg px-4.5 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Inquilino(a)</span>
              <span className="font-semibold">{inquilino.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Propiedad</span>
              <span className="font-semibold">{inquilino.propiedad.direccion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Monto reportado</span>
              <span className="font-heading font-bold">₡{Number(factura.monto).toLocaleString("es-CR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Enviado el</span>
              <span className="font-semibold">
                {factura.comprobanteSubidoEn?.toLocaleString("es-CR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-bold">Comprobante adjunto</span>
            <a
              href={`/comprobante/${factura.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3.5 rounded-xl border border-border bg-bg p-4.5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-primary-light text-primary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{factura.comprobanteNombre}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {factura.comprobanteTipo} · {kb} KB
                </p>
              </div>
              <span className="text-[13px] font-semibold text-accent">Ver</span>
            </a>
          </div>

          <div className="flex items-start gap-2.5 rounded-[10px] bg-primary-light p-3.5">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="8" x2="12" y2="8.1"/><line x1="12" y1="11" x2="12" y2="16"/></svg>
            <p className="text-[13px] leading-relaxed text-primary-dark">
              Verifique que el monto, la fecha y la cuenta coincidan antes de confirmar. Al
              confirmar, el pago queda autorizado y registrado en el historial de {primerNombre}.
            </p>
          </div>

          <div className="flex gap-3">
            <form action={rechazarComprobante} className="flex-1">
              <input type="hidden" name="facturaId" value={factura.id} />
              <button
                type="submit"
                className="w-full rounded-[10px] border-[1.5px] border-border py-3 text-[14.5px] font-semibold text-ink-soft"
              >
                Rechazar comprobante
              </button>
            </form>
            <form action={confirmarComprobante} className="flex-[1.4]">
              <input type="hidden" name="facturaId" value={factura.id} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-success py-3 text-[14.5px] font-bold text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                Confirmar pago
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
