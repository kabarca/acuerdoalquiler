import { formatearMonto, sumarPorMoneda } from "@/lib/moneda";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagado",
  ATRASADA: "Vencido",
  EN_REVISION: "En revisión",
};

const ESTADO_TONO: Record<string, string> = {
  PENDIENTE: "bg-warning-bg text-warning",
  PAGADA: "bg-success-bg text-success",
  ATRASADA: "bg-danger-bg text-danger",
  EN_REVISION: "bg-primary-light text-primary",
};

const METODO_LABEL: Record<string, string> = {
  TRANSFERENCIA: "Transferencia ACH",
  DEBITO: "Tarjeta débito",
  CREDITO: "Tarjeta crédito",
};

const RANGOS = [
  { id: "todas", label: "Todas las propiedades" },
  { id: "mes", label: "Este mes" },
  { id: "90d", label: "Últimos 90 días" },
  { id: "anio", label: String(new Date().getFullYear()) },
] as const;

function inicioDeRango(rango: string) {
  const ahora = new Date();
  if (rango === "mes") return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  if (rango === "90d") return new Date(Date.now() - 90 * 86_400_000);
  if (rango === "anio") return new Date(ahora.getFullYear(), 0, 1);
  return null;
}

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { rango } = await searchParams;
  const rangoActivo = RANGOS.some((r) => r.id === rango) ? rango! : "todas";
  const desde = inicioDeRango(rangoActivo);

  const facturas = await prisma.factura.findMany({
    where: {
      inquilino: { propiedad: { arrendadorId: arrendador.id } },
      ...(desde ? { creadoEn: { gte: desde } } : {}),
    },
    include: { inquilino: { include: { propiedad: true } } },
    orderBy: { creadoEn: "desc" },
  });

  const pagadas = facturas.filter((f) => f.estado === "PAGADA");
  const cobradoTotal = sumarPorMoneda(pagadas.map((f) => ({ monto: f.monto, moneda: f.moneda })));

  return (
    <div className="flex flex-col gap-6 px-11 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-semibold">Pagos y transacciones</h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            Todo el historial de cobros de sus propiedades, en un solo lugar.
          </p>
        </div>
        <a
          href="/dashboard/pagos/exportar"
          className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-border px-4.5 py-2.75 text-[13.5px] font-semibold text-ink-soft"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13"/><path d="M6.5 11.5 12 17l5.5-5.5"/><path d="M4 20.5h16"/></svg>
          Exportar CSV
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-[14px] border border-border bg-surface px-5.5 py-5">
          <p className="text-[13px] font-semibold text-ink-faint">
            Cobrado {rangoActivo === "anio" ? `en ${new Date().getFullYear()}` : "en el periodo"}
          </p>
          <p className="mt-1.5 font-heading text-2xl font-bold">{cobradoTotal}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-surface px-5.5 py-5">
          <p className="text-[13px] font-semibold text-ink-faint">Transacciones</p>
          <p className="mt-1.5 font-heading text-2xl font-bold">{pagadas.length}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-surface px-5.5 py-5">
          <p className="text-[13px] font-semibold text-ink-faint">Costo en comisiones</p>
          <p className="mt-1.5 font-heading text-2xl font-bold">Sin comisión</p>
          <p className="mt-0.5 text-xs text-ink-faint">Cobrar por transferencia bancaria no tiene costo</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {RANGOS.map((r) => (
          <Link
            key={r.id}
            href={r.id === "todas" ? "/dashboard/pagos" : `/dashboard/pagos?rango=${r.id}`}
            className={`rounded-[9px] border-[1.5px] px-3.5 py-2 text-[13px] font-semibold ${
              rangoActivo === r.id
                ? "border-primary bg-primary text-white"
                : "border-border text-ink-soft"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
        {facturas.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">No hay transacciones en este periodo.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-4.5 py-3">Fecha</th>
                <th className="px-4.5 py-3">Propiedad</th>
                <th className="px-4.5 py-3">Inquilino</th>
                <th className="px-4.5 py-3">Monto</th>
                <th className="px-4.5 py-3">Método</th>
                <th className="px-4.5 py-3">Estado</th>
                <th className="px-4.5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-t border-border text-sm">
                  <td className="px-4.5 py-3.5">
                    {(f.pagadoEn ?? f.creadoEn).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4.5 py-3.5 font-semibold">{f.inquilino.propiedad.direccion}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">{f.inquilino.nombre}</td>
                  <td className="px-4.5 py-3.5 font-semibold">{formatearMonto(f.monto, f.moneda)}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">{f.metodoPago ? METODO_LABEL[f.metodoPago] : "—"}</td>
                  <td className="px-4.5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_TONO[f.estado]}`}>
                      {ESTADO_LABEL[f.estado]}
                    </span>
                  </td>
                  <td className="px-4.5 py-3.5 text-right">
                    <Link
                      href={f.estado === "EN_REVISION" ? `/dashboard/facturas/${f.id}/confirmar` : `/pagar/${f.id}`}
                      className="text-xs font-semibold text-accent"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Link
        href="/dashboard/pagos/certificado"
        className="flex items-center justify-between rounded-[14px] border border-border bg-surface px-6 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-[9px] bg-primary-light text-primary">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/></svg>
          </div>
          <div>
            <p className="text-[14.5px] font-bold">Certificado anual de ingresos {new Date().getFullYear()}</p>
            <p className="text-[12.5px] text-ink-faint">Resumen para su declaración de renta</p>
          </div>
        </div>
        <span className="text-[13.5px] font-semibold text-accent">Ver certificado</span>
      </Link>
    </div>
  );
}
