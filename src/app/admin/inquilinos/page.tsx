import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminInquilinosPage() {
  const inquilinos = await prisma.inquilino.findMany({
    include: {
      propiedad: { include: { arrendador: true } },
      facturas: { where: { estado: "ATRASADA" } },
      disputas: { where: { resolucion: "MOROSO" } },
    },
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Link href="/admin" className="text-[13.5px] font-semibold text-accent">
        ← Volver al panel
      </Link>

      <div className="mt-3 flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold">Inquilinos</h1>
        <p className="text-[14.5px] text-ink-soft">
          {inquilinos.length} {inquilinos.length === 1 ? "inquilino registrado" : "inquilinos registrados"} en Rentia (incluye históricos).
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-border bg-surface">
        {inquilinos.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">No hay inquilinos registrados todavía.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-4.5 py-3">Nombre</th>
                <th className="px-4.5 py-3">Propiedad</th>
                <th className="px-4.5 py-3">Arrendador</th>
                <th className="px-4.5 py-3">Renta</th>
                <th className="px-4.5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inquilinos.map((i) => {
                const moroso = i.disputas.length > 0;
                const atrasado = i.facturas.length > 0;
                return (
                  <tr key={i.id} className="border-t border-border text-sm">
                    <td className="px-4.5 py-3.5 font-semibold">
                      {i.nombre}
                      <span className="block text-xs font-normal text-ink-faint">{i.email}</span>
                    </td>
                    <td className="px-4.5 py-3.5 text-ink-soft">{i.propiedad.direccion}</td>
                    <td className="px-4.5 py-3.5 text-ink-soft">{i.propiedad.arrendador.nombre}</td>
                    <td className="px-4.5 py-3.5">₡{Number(i.montoRenta).toLocaleString("es-CR")}</td>
                    <td className="px-4.5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {!i.activo && (
                          <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-bold text-ink-faint">
                            Inactivo
                          </span>
                        )}
                        {moroso && (
                          <span className="rounded-full bg-danger-bg px-2.5 py-1 text-xs font-bold text-danger">
                            Moroso
                          </span>
                        )}
                        {atrasado && (
                          <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-bold text-warning">
                            Factura vencida
                          </span>
                        )}
                        {i.activo && !moroso && !atrasado && (
                          <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-bold text-success">
                            Al día
                          </span>
                        )}
                      </div>
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
