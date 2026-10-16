import { sumarPorMoneda, type Moneda } from "@/lib/moneda";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { BotonImprimir } from "./imprimir-boton";

export default async function CertificadoPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { anio } = await searchParams;
  const year = Number(anio) || new Date().getFullYear();

  const facturas = await prisma.factura.findMany({
    where: {
      inquilino: { propiedad: { arrendadorId: arrendador.id } },
      estado: "PAGADA",
      pagadoEn: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
    },
    include: { inquilino: { include: { propiedad: true } } },
    orderBy: { pagadoEn: "asc" },
  });

  const porPropiedad = new Map<string, { direccion: string; montos: { monto: number; moneda: Moneda }[]; pagos: number }>();
  for (const f of facturas) {
    const key = f.inquilino.propiedad.id;
    const actual = porPropiedad.get(key) ?? { direccion: f.inquilino.propiedad.direccion, montos: [], pagos: 0 };
    actual.montos.push({ monto: Number(f.monto), moneda: f.moneda });
    actual.pagos += 1;
    porPropiedad.set(key, actual);
  }

  const total = sumarPorMoneda([...porPropiedad.values()].flatMap((p) => p.montos));

  return (
    <div className="flex flex-col gap-6 px-11 py-9 print:px-0 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Certificado anual de ingresos {year}</h1>
          <p className="mt-1 text-[14.5px] text-ink-soft">
            Resumen de arriendo cobrado, para su declaración de renta.
          </p>
        </div>
        <BotonImprimir />
      </div>

      <div className="max-w-2xl rounded-2xl border border-border bg-surface p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
          </div>
          <span className="font-heading text-base font-bold">Acuerdo Alquiler</span>
        </div>

        <h2 className="mt-6 text-lg font-bold">Certificado de ingresos por arriendo — {year}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Arrendador: {arrendador.nombre} ({arrendador.email})
        </p>

        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-xs font-bold tracking-wide text-ink-faint uppercase">
              <th className="py-2">Propiedad</th>
              <th className="py-2">Pagos recibidos</th>
              <th className="py-2 text-right">Total cobrado</th>
            </tr>
          </thead>
          <tbody>
            {[...porPropiedad.values()].map((p) => (
              <tr key={p.direccion} className="border-b border-border text-sm">
                <td className="py-2.5">{p.direccion}</td>
                <td className="py-2.5">{p.pagos}</td>
                <td className="py-2.5 text-right font-semibold">{sumarPorMoneda(p.montos)}</td>
              </tr>
            ))}
            {porPropiedad.size === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-sm text-ink-soft">
                  No hay pagos confirmados en {year}.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="text-sm font-bold">
              <td className="pt-3" colSpan={2}>
                Total {year}
              </td>
              <td className="pt-3 text-right font-heading text-base">{total}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-6 text-xs leading-relaxed text-ink-faint">
          Este documento es un resumen generado automáticamente por Acuerdo Alquiler a partir de los pagos
          confirmados en el sistema. No sustituye asesoría contable ni tributaria profesional.
        </p>
      </div>
    </div>
  );
}
