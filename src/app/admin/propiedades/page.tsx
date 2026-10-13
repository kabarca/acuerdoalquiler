import Link from "next/link";
import { prisma } from "@/lib/prisma";

const TIPO_LABEL: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  LOCAL_COMERCIAL: "Local comercial",
};

export default async function AdminPropiedadesPage() {
  const propiedades = await prisma.propiedad.findMany({
    include: {
      arrendador: true,
      _count: { select: { inquilinos: { where: { activo: true } } } },
    },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Link href="/admin" className="text-[13.5px] font-semibold text-accent">
        ← Volver al panel
      </Link>

      <div className="mt-3 flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold">Propiedades</h1>
        <p className="text-[14.5px] text-ink-soft">
          {propiedades.length} {propiedades.length === 1 ? "propiedad registrada" : "propiedades registradas"} en Acuerdo Alquiler.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-border bg-surface">
        {propiedades.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">No hay propiedades registradas todavía.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-4.5 py-3">Dirección</th>
                <th className="px-4.5 py-3">Tipo</th>
                <th className="px-4.5 py-3">Cantón</th>
                <th className="px-4.5 py-3">Arrendador</th>
                <th className="px-4.5 py-3">Inquilinos activos</th>
                <th className="px-4.5 py-3">Registrada</th>
              </tr>
            </thead>
            <tbody>
              {propiedades.map((p) => (
                <tr key={p.id} className="border-t border-border text-sm">
                  <td className="px-4.5 py-3.5 font-semibold">{p.direccion}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">{TIPO_LABEL[p.tipo]}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">{p.canton ?? "—"}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">
                    {p.arrendador.nombre}
                    <span className="block text-xs text-ink-faint">{p.arrendador.email}</span>
                  </td>
                  <td className="px-4.5 py-3.5">{p._count.inquilinos}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">
                    {p.creadoEn.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })}
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
