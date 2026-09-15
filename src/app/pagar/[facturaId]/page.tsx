import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { subirComprobante } from "./actions";

function Logo() {
  return (
    <div className="flex items-center gap-2.5 border-b border-border px-9 py-7">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
      </div>
      <span className="font-heading text-base font-bold">Rentia</span>
    </div>
  );
}

const TABS = [
  { id: "transferencia", label: "Transferencia bancaria" },
  { id: "debito", label: "Tarjeta de débito" },
  { id: "credito", label: "Tarjeta de crédito" },
] as const;

export default async function PagarFacturaPage({
  params,
  searchParams,
}: {
  params: Promise<{ facturaId: string }>;
  searchParams: Promise<{ metodo?: string }>;
}) {
  const { facturaId } = await params;
  const { metodo } = await searchParams;

  const factura = await prisma.factura.findUnique({
    where: { id: facturaId },
    include: { inquilino: { include: { propiedad: { include: { arrendador: true } } } } },
  });

  if (!factura) {
    notFound();
  }

  const { inquilino } = factura;
  const { arrendador } = inquilino.propiedad;
  const monto = Number(factura.monto).toLocaleString("es-CR");
  const tabActivo = TABS.some((t) => t.id === metodo)
    ? metodo!
    : (inquilino.metodoPagoPreferido?.toLowerCase() ?? "debito");

  if (factura.estado === "PAGADA") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
        <div className="flex w-full max-w-[480px] flex-col items-center gap-5 rounded-[18px] border border-border bg-surface p-11 text-center shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[22px] font-semibold">¡Pago realizado con éxito!</h1>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Su pago fue procesado correctamente. Le enviamos el comprobante a su correo
              electrónico.
            </p>
          </div>
          <div className="w-full rounded-xl bg-bg p-5 text-left">
            <div className="flex justify-between border-b border-border py-2.5 text-sm">
              <span className="text-ink-soft">Propiedad</span>
              <span className="font-semibold">{inquilino.propiedad.direccion}</span>
            </div>
            <div className="flex justify-between border-b border-border py-2.5 text-sm">
              <span className="text-ink-soft">Fecha de pago</span>
              <span className="font-semibold">
                {factura.pagadoEn?.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-ink-soft">Monto pagado</span>
              <span className="font-heading font-bold">₡{monto}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (factura.estado === "EN_REVISION") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
        <div className="flex w-full max-w-[480px] flex-col items-center gap-5 rounded-[18px] border border-border bg-surface p-11 text-center shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-bg">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[22px] font-semibold">Comprobante enviado</h1>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Recibimos su comprobante. Su arrendador lo revisará y confirmará el pago antes de que
              quede autorizado.
            </p>
          </div>
          <div className="w-full rounded-xl bg-bg p-5 text-left">
            <div className="flex justify-between border-b border-border py-2.5 text-sm">
              <span className="text-ink-soft">Propiedad</span>
              <span className="font-semibold">{inquilino.propiedad.direccion}</span>
            </div>
            <div className="flex justify-between border-b border-border py-2.5 text-sm">
              <span className="text-ink-soft">Monto</span>
              <span className="font-semibold">₡{monto}</span>
            </div>
            <div className="flex justify-between border-b border-border py-2.5 text-sm">
              <span className="text-ink-soft">Comprobante</span>
              <span className="font-semibold">{factura.comprobanteNombre}</span>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-ink-soft">Estado</span>
              <span className="font-bold text-warning">Pendiente de confirmación</span>
            </div>
          </div>
          <p className="text-[12.5px] text-ink-faint">
            Le avisaremos por correo apenas su arrendador confirme el pago.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[18px] border border-border bg-surface shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
        <Logo />

        <div className="border-b border-border px-9 py-6">
          <span className="text-[13px] font-semibold text-ink-faint">PAGAR ARRIENDO</span>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[15.5px] font-semibold">{inquilino.propiedad.direccion}</span>
            <span className="font-heading text-xl font-bold">₡{monto}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5.5 px-9 py-8">
          <div className="flex gap-1 rounded-[10px] border border-border bg-bg p-1">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={`/pagar/${facturaId}?metodo=${t.id}`}
                className={`flex-1 rounded-lg py-2.25 text-center text-[13px] font-semibold ${
                  tabActivo === t.id ? "bg-surface font-bold shadow-sm" : "text-ink-faint"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {tabActivo === "transferencia" ? (
            <>
              <p className="-mt-3 text-[12.5px] text-ink-faint">
                Sin costo adicional. El pago queda pendiente hasta que su arrendador confirme el
                comprobante.
              </p>

              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-bold">Datos para la transferencia</span>
                <div className="flex flex-col gap-2 rounded-[10px] bg-bg px-4.5 py-4 text-[13.5px]">
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Banco</span>
                    <span className="font-semibold">{arrendador.banco ?? "Sin configurar"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Cuenta IBAN</span>
                    <span className="font-semibold">{arrendador.cuentaIban ?? "Sin configurar"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Titular</span>
                    <span className="font-semibold">{arrendador.titularCuenta ?? "Sin configurar"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Referencia</span>
                    <span className="font-semibold">
                      Arriendo {inquilino.propiedad.direccion.split(",")[0]} — {factura.periodo}
                    </span>
                  </div>
                </div>
              </div>

              <form action={subirComprobante} className="flex flex-col gap-3.5">
                <input type="hidden" name="facturaId" value={factura.id} />
                <span className="text-sm font-bold">Adjuntar comprobante de pago</span>
                <label className="flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-border bg-bg px-5 py-7 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-light text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
                  </div>
                  <span className="text-[13.5px] font-semibold text-ink-soft">
                    Haga clic para elegir el comprobante
                  </span>
                  <span className="text-xs text-ink-faint">PDF, JPG o PNG · máx. 10 MB</span>
                  <input
                    type="file"
                    name="comprobante"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    className="sr-only"
                  />
                </label>

                <button
                  type="submit"
                  className="rounded-[10px] bg-primary py-4 text-center text-[15.5px] font-bold text-white hover:bg-primary-dark"
                >
                  Enviar comprobante
                </button>
              </form>

              <div className="flex items-start justify-center gap-2 text-center text-[12.5px] leading-relaxed text-ink-faint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="8" x2="12" y2="8.1"/><line x1="12" y1="11" x2="12" y2="16"/></svg>
                Su arrendador revisará el comprobante y confirmará el pago antes de que quede
                autorizado.
              </div>
            </>
          ) : (
            <>
              <p className="-mt-3 text-[12.5px] text-ink-faint">
                Costo de la transacción para usted:{" "}
                <strong className="text-ink-soft">
                  {tabActivo === "debito" ? "₡3.500" : "2.9%"}
                </strong>
                .
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink-soft">Número de tarjeta</label>
                  <input
                    disabled
                    placeholder="4111 1111 1111 1111"
                    className="w-full rounded-[10px] border-[1.5px] border-border bg-bg px-3.5 py-3 text-[15px] text-ink-faint"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink-soft">Nombre en la tarjeta</label>
                  <input
                    disabled
                    placeholder="Como aparece en la tarjeta"
                    className="w-full rounded-[10px] border-[1.5px] border-border bg-bg px-3.5 py-3 text-[15px] text-ink-faint"
                  />
                </div>
                <div className="flex gap-3.5">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-ink-soft">Vencimiento</label>
                    <input
                      disabled
                      placeholder="MM/AA"
                      className="w-full rounded-[10px] border-[1.5px] border-border bg-bg px-3.5 py-3 text-[15px] text-ink-faint"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-ink-soft">CVV</label>
                    <input
                      disabled
                      placeholder="123"
                      className="w-full rounded-[10px] border-[1.5px] border-border bg-bg px-3.5 py-3 text-[15px] text-ink-faint"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-[10px] bg-bg px-4.5 py-4 text-[14.5px]">
                <span className="text-ink-soft">Total a pagar</span>
                <span className="font-heading text-lg font-bold">₡{monto}</span>
              </div>

              {factura.onvopayPaymentLinkUrl ? (
                <a
                  href={factura.onvopayPaymentLinkUrl}
                  className="rounded-[10px] bg-primary py-4 text-center text-[15.5px] font-bold text-white hover:bg-primary-dark"
                >
                  Pagar ₡{monto}
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-[10px] bg-primary/40 py-4 text-center text-[15.5px] font-bold text-white"
                  >
                    Pagar ₡{monto}
                  </button>
                  <p className="text-center text-[12.5px] text-ink-faint">
                    El cobro con tarjeta todavía no está activo — falta conectar Onvopay.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[12.5px] text-ink-faint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>
                Sus datos de pago están cifrados y protegidos
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
