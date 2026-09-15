import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagado",
  ATRASADA: "Vencido",
};

const ESTADO_TONO: Record<string, string> = {
  PENDIENTE: "bg-warning-bg text-warning",
  PAGADA: "bg-success-bg text-success",
  ATRASADA: "bg-danger-bg text-danger",
};

export default async function PagosPage() {
  const arrendador = await getArrendadorActual();

  const facturas = await prisma.factura.findMany({
    where: { inquilino: { propiedad: { arrendadorId: arrendador.id } } },
    include: { inquilino: { include: { propiedad: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="flex flex-col gap-7 px-11 py-9">
      <div>
        <h1 className="text-2xl font-semibold">Pagos y transacciones</h1>
        <p className="mt-1 text-[14.5px] text-ink-soft">
          Historial de facturas de todas sus propiedades.
        </p>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
        {facturas.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">Todavía no hay facturas generadas.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[12.5px] font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-5 py-3">Propiedad</th>
                <th className="px-5 py-3">Inquilino</th>
                <th className="px-5 py-3">Periodo</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Vencimiento</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-t border-border text-[14.5px]">
                  <td className="px-5 py-4 font-semibold">{f.inquilino.propiedad.direccion}</td>
                  <td className="px-5 py-4 text-ink-soft">{f.inquilino.nombre}</td>
                  <td className="px-5 py-4 text-ink-soft">{f.periodo}</td>
                  <td className="px-5 py-4 font-semibold">₡{Number(f.monto).toLocaleString("es-CR")}</td>
                  <td className="px-5 py-4 text-ink-soft">{f.fechaVencimiento.toLocaleDateString("es-CR")}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_TONO[f.estado]}`}>
                      {ESTADO_LABEL[f.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/pagar/${f.id}`} className="font-semibold text-accent">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
