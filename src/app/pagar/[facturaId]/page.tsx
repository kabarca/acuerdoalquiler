import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  ATRASADA: "Atrasada",
};

// Página pública (sin login) a la que llega el inquilino desde el correo.
export default async function PagarFacturaPage({
  params,
}: {
  params: Promise<{ facturaId: string }>;
}) {
  const { facturaId } = await params;

  const factura = await prisma.factura.findUnique({
    where: { id: facturaId },
    include: { inquilino: { include: { propiedad: true } } },
  });

  if (!factura) {
    notFound();
  }

  const { inquilino } = factura;
  const yaPagada = factura.estado === "PAGADA";

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <p className="text-sm text-muted">{inquilino.propiedad.direccion}</p>
          <h1 className="text-xl font-semibold">Factura de alquiler</h1>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Inquilino</span>
            <span>{inquilino.nombre}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Periodo</span>
            <span>{factura.periodo}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Vence</span>
            <span>{factura.fechaVencimiento.toLocaleDateString("es-CR")}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Estado</span>
            <span>{ESTADO_LABEL[factura.estado]}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-medium">
            <span>Monto</span>
            <span>₡{factura.monto.toString()}</span>
          </div>
        </div>

        <div className="mt-6">
          {yaPagada ? (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-center text-sm text-green-700">
              Esta factura ya fue pagada. ¡Gracias!
            </p>
          ) : factura.onvopayPaymentLinkUrl ? (
            <a
              href={factura.onvopayPaymentLinkUrl}
              className="block rounded-lg bg-primary px-3 py-3 text-center text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
            >
              Pagar con tarjeta
            </a>
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
              El link de pago todavía no está disponible. Contacta a tu
              arrendador.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
