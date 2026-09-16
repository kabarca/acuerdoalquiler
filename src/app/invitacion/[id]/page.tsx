import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { confirmarMetodoPago } from "./actions";

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

export default async function InvitacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmado?: string }>;
}) {
  const { id } = await params;
  const { confirmado } = await searchParams;

  const inquilino = await prisma.inquilino.findUnique({
    where: { id },
    include: { propiedad: { include: { arrendador: true } } },
  });

  if (!inquilino) {
    notFound();
  }

  const monto = Number(inquilino.montoRenta).toLocaleString("es-CR");
  const { arrendador } = inquilino.propiedad;

  if (confirmado || inquilino.metodoPagoPreferido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
        <div className="flex w-full max-w-[480px] flex-col items-center gap-5 rounded-[18px] border border-border bg-surface p-11 text-center shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
          </div>
          <h1 className="text-[22px] font-semibold">Método de pago configurado</h1>
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            Quedó guardado para {inquilino.propiedad.direccion}. Recibirá la factura de{" "}
            {inquilino.diaCobro} de cada mes por correo, con el link de pago.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-10">
      <div className="mx-auto flex max-w-[520px] flex-col gap-5">
        <Logo />

        <div className="overflow-hidden rounded-[18px] border border-border bg-surface shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
          <div className="flex flex-col gap-1.5 border-b border-border px-8 py-7">
            <span className="text-[12.5px] font-bold text-ink-faint">INVITACIÓN DE PAGO</span>
            <h1 className="text-[21px] font-semibold">Configure el pago de su arriendo</h1>
            <p className="text-sm leading-relaxed text-ink-soft">
              Su arrendador le ha invitado a registrar su método de pago para{" "}
              <strong>{inquilino.propiedad.direccion}</strong> — ₡{monto} mensuales, vence el día{" "}
              {inquilino.diaCobro}.
            </p>
          </div>

          <form action={confirmarMetodoPago} className="flex flex-col gap-5 px-8 py-7">
            <input type="hidden" name="inquilinoId" value={inquilino.id} />
            <input type="hidden" name="metodoPagoPreferido" value="TRANSFERENCIA" />

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink-soft">Cómo va a pagar</label>
              <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-primary bg-primary-light p-3.5 text-[13px] font-semibold text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M4 10.5l8-6 8 6"/><path d="M5.5 10.5v8M18.5 10.5v8"/><path d="M3 21h18"/><path d="M9 14.5v3M15 14.5v3"/></svg>
                Transferencia bancaria — sin costo
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[13px] font-semibold text-ink-soft">Datos para transferir</label>
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
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink-soft">Cédula (opcional)</label>
              <input
                name="cedula"
                placeholder="1-1234-5678"
                className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
              />
            </div>

            <label className="flex items-start gap-2.5 rounded-[10px] bg-primary-light p-3.5">
              <input type="checkbox" name="compartirHistorial" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-primary" />
              <span className="text-[12.5px] leading-relaxed text-primary-dark">
                Autorizo compartir mi historial de pago con otros arrendadores verificados en Rentia
                (me ayuda a alquilar más fácil en el futuro — puedo retirar mi autorización cuando
                quiera).
              </span>
            </label>

            <div className="flex items-start gap-2.5 rounded-[10px] bg-bg px-4 py-3.5 text-[13px] leading-relaxed text-ink-soft">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="8" x2="12" y2="8.1"/><line x1="12" y1="11" x2="12" y2="16"/></svg>
              Cada mes deberá transferir el monto a esta cuenta y subir el comprobante desde el link
              de pago. Su arrendador confirmará el pago antes de que quede autorizado.
            </div>

            <button
              type="submit"
              className="rounded-[10px] bg-primary py-3.75 text-[15px] font-bold text-white hover:bg-primary-dark"
            >
              Confirmar método de pago
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-ink-faint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>
              Sus datos están cifrados. Rentia nunca comparte su información con su arrendador sin
              su autorización.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
