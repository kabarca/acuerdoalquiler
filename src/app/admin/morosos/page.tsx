import { sumarPorMoneda } from "@/lib/moneda";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminMorososPage() {
  const inquilinos = await prisma.inquilino.findMany({
    where: {
      OR: [
        { facturas: { some: { estado: "ATRASADA" } } },
        { disputas: { some: { resolucion: "MOROSO" } } },
      ],
    },
    include: {
      propiedad: { include: { arrendador: true } },
      facturas: { where: { estado: "ATRASADA" }, orderBy: { fechaVencimiento: "asc" } },
      disputas: { where: { resolucion: "MOROSO" } },
    },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Link href="/admin" className="text-[13.5px] font-semibold text-accent">
        ← Volver al panel
      </Link>

      <div className="mt-3 flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold">Morosos / sin pagar</h1>
        <p className="text-[14.5px] text-ink-soft">
          Inquilinos con al menos una factura vencida sin pagar, o marcados como morosos tras una
          disputa. {inquilinos.length} {inquilinos.length === 1 ? "caso" : "casos"} en total.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-border bg-surface">
        {inquilinos.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">
            No hay inquilinos con facturas vencidas ni marcados como morosos.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-4.5 py-3">Inquilino</th>
                <th className="px-4.5 py-3">Propiedad</th>
                <th className="px-4.5 py-3">Arrendador</th>
                <th className="px-4.5 py-3">Facturas vencidas</th>
                <th className="px-4.5 py-3">Monto atrasado</th>
                <th className="px-4.5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inquilinos.map((i) => {
                const montoAtrasado = sumarPorMoneda(i.facturas.map((f) => ({ monto: f.monto, moneda: f.moneda })));
                const moroso = i.disputas.length > 0;
                return (
                  <tr key={i.id} className="border-t border-border text-sm">
                    <td className="px-4.5 py-3.5 font-semibold">
                      {i.nombre}
                      <span className="block text-xs font-normal text-ink-faint">{i.email}</span>
                    </td>
                    <td className="px-4.5 py-3.5 text-ink-soft">{i.propiedad.direccion}</td>
                    <td className="px-4.5 py-3.5 text-ink-soft">
                      {i.propiedad.arrendador.nombre}
                      <span className="block text-xs text-ink-faint">{i.propiedad.arrendador.email}</span>
                    </td>
                    <td className="px-4.5 py-3.5">{i.facturas.length}</td>
                    <td className="px-4.5 py-3.5 font-semibold text-danger">
                      {montoAtrasado}
                    </td>
                    <td className="px-4.5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          moroso ? "bg-danger-bg text-danger" : "bg-warning-bg text-warning"
                        }`}
                      >
                        {moroso ? "Moroso" : "Facturas vencidas"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
