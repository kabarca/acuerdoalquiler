import { formatearMonto } from "@/lib/moneda";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { registrarRespuestaInquilino } from "../../actions";

function fmt(fecha: Date) {
  return fecha.toLocaleDateString("es-CR", { day: "numeric", month: "long" });
}

export default async function DisputaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;

  const disputa = await prisma.disputa.findFirst({
    where: { id, inquilino: { propiedad: { arrendadorId: arrendador.id } } },
    include: { factura: true, inquilino: { include: { propiedad: true } } },
  });

  if (!disputa) {
    notFound();
  }

  const { factura, inquilino } = disputa;
  const primerNombre = inquilino.nombre.split(" ")[0];

  if (disputa.estado === "RESUELTA") {
    const pasos = [
      {
        fecha: disputa.fechaApertura,
        texto: `Se abrió la disputa automáticamente: ${disputa.motivoApertura}`,
      },
      ...(disputa.respuestaInquilino
        ? [
            {
              fecha: disputa.fechaRespuesta!,
              texto: `${primerNombre} respondió: "${disputa.respuestaInquilino}"`,
            },
          ]
        : []),
      {
        fecha: disputa.fechaResolucion!,
        texto:
          disputa.resolucion === "PRORROGA"
            ? `Se revisó la explicación y se otorgó una prórroga hasta el ${disputa.nuevaFechaVencimiento ? fmt(disputa.nuevaFechaVencimiento) : "—"}.`
            : `Se marcó a ${primerNombre} como moroso(a). Motivo: "${disputa.motivoResolucion}"`,
      },
    ];

    return (
      <div className="mx-auto max-w-[560px] px-6 py-10">
        <div className="overflow-hidden rounded-[18px] border border-border bg-surface shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
          <div className="flex items-center justify-between border-b border-border px-8 py-6.5">
            <div>
              <span className="text-[12.5px] font-bold text-ink-faint">
                DISPUTA #{disputa.id.slice(0, 5).toUpperCase()}
              </span>
              <h1 className="mt-0.5 text-[19px] font-semibold">{inquilino.propiedad.direccion}</h1>
            </div>
            <span className="rounded-full bg-success-bg px-3 py-1.5 text-[12.5px] font-bold text-success">
              Resuelta
            </span>
          </div>

          <div className="px-8 py-7">
            {pasos.map((paso, i) => (
              <div key={i} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${i === pasos.length - 1 ? "bg-success" : "bg-ink-faint"}`}
                  />
                  {i < pasos.length - 1 && <div className="my-1 w-[1.5px] flex-1 bg-border" />}
                </div>
                <div className={i < pasos.length - 1 ? "pb-5" : ""}>
                  <p className="text-sm font-bold">{fmt(paso.fecha)}</p>
                  <p className="mt-0.5 text-[13.5px] text-ink-soft">{paso.texto}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-8 mb-7 flex items-center gap-3 rounded-xl bg-success-bg p-4.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
            <p className="text-[13.5px] font-semibold text-success">
              {disputa.resolucion === "PRORROGA"
                ? `Disputa cerrada con una prórroga. La reputación de ${primerNombre} no se vio afectada.`
                : `Disputa cerrada. ${primerNombre} quedó marcado(a) como moroso(a) en su historial.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const ahora = new Date();
  const dias = Math.max(
    1,
    Math.round((ahora.getTime() - factura.fechaVencimiento.getTime()) / 86_400_000),
  );

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <div className="overflow-hidden rounded-[18px] border border-border bg-surface shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
        <div className="flex items-center gap-3 border-b border-border px-8 py-6.5">
          <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[10px] bg-warning-bg">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.5 20.5h19L12 4Z"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="12" y1="17.5" x2="12" y2="17.6"/></svg>
          </div>
          <div>
            <span className="text-[12.5px] font-bold text-warning">SE ABRIÓ UNA DISPUTA DE PAGO</span>
            <h1 className="text-[19px] font-semibold">{primerNombre} no ha realizado su pago</h1>
          </div>
        </div>

        <div className="flex flex-col gap-5.5 px-8 py-7">
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            Estimado(a) {arrendador.nombre.split(" ")[0]}: <strong>{inquilino.nombre}</strong> no ha
            realizado el pago de <strong>{inquilino.propiedad.direccion}</strong> correspondiente a{" "}
            {factura.periodo}. Han transcurrido <strong>{dias} día(s)</strong> desde la fecha de
            vencimiento.
          </p>

          <div className="flex flex-col gap-2 rounded-[10px] bg-bg px-4.5 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Monto pendiente</span>
              <span className="font-heading font-bold">{formatearMonto(factura.monto, factura.moneda)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Venció el</span>
              <span className="font-semibold">{fmt(factura.fechaVencimiento)}</span>
            </div>
          </div>

          {disputa.respuestaInquilino && (
            <div className="rounded-[10px] bg-primary-light p-4.5 text-[13.5px] text-primary-dark">
              <strong>{primerNombre} respondió:</strong> &ldquo;{disputa.respuestaInquilino}&rdquo;
            </div>
          )}

          {!disputa.respuestaInquilino && (
            <details>
              <summary className="cursor-pointer text-[13.5px] font-semibold text-accent">
                Registrar lo que {primerNombre} le explicó
              </summary>
              <form action={registrarRespuestaInquilino} className="mt-3 flex flex-col gap-2.5">
                <input type="hidden" name="disputaId" value={disputa.id} />
                <textarea
                  name="respuestaInquilino"
                  rows={2}
                  placeholder={`Ej. "Tuve un inconveniente con mi banco. Puedo pagar la próxima semana."`}
                  className="w-full resize-none rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[14px] outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="self-start rounded-[9px] border-[1.5px] border-border px-4 py-2 text-[13px] font-semibold text-ink-soft"
                >
                  Guardar respuesta
                </button>
              </form>
            </details>
          )}

          <div className="flex flex-col gap-2.5">
            <p className="text-[14.5px] font-bold">¿Qué desea hacer?</p>
            <div className="flex gap-3.5">
              <Link
                href={`/dashboard/disputas/${disputa.id}/prorroga`}
                className="flex flex-1 flex-col gap-2.5 rounded-[14px] border-[1.5px] border-border p-5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
                <span className="text-[14.5px] font-bold">Otorgar una prórroga</span>
                <span className="text-[12.5px] leading-relaxed text-ink-faint">
                  Le da más tiempo a {primerNombre}. La disputa se cierra sola si paga antes de la
                  nueva fecha.
                </span>
              </Link>
              <Link
                href={`/dashboard/disputas/${disputa.id}/moroso`}
                className="flex flex-1 flex-col gap-2.5 rounded-[14px] border-[1.5px] border-danger p-5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12.5"/><line x1="12" y1="15.5" x2="12" y2="15.6"/></svg>
                <span className="text-[14.5px] font-bold text-danger">Marcar como moroso(a)</span>
                <span className="text-[12.5px] leading-relaxed text-ink-faint">
                  Afecta la reputación de {primerNombre} en Acuerdo Alquiler. Deberá explicar el motivo.
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-faint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="8" x2="12" y2="8.1"/><line x1="12" y1="11" x2="12" y2="16"/></svg>
            {primerNombre} también podrá explicar su situación antes de que la disputa se resuelva.
            Nada se marca de forma automática.
          </div>
        </div>
      </div>
    </div>
  );
}
