import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IconBuilding, IconUsers, IconGrid, IconAlert } from "@/lib/icons";

export default async function AdminPage() {
  const [arrendadores, propiedades, inquilinosActivos, inquilinosTotal, morosos] = await Promise.all([
    prisma.arrendador.count(),
    prisma.propiedad.count(),
    prisma.inquilino.count({ where: { activo: true } }),
    prisma.inquilino.count(),
    prisma.inquilino.count({
      where: {
        OR: [
          { facturas: { some: { estado: "ATRASADA" } } },
          { disputas: { some: { resolucion: "MOROSO" } } },
        ],
      },
    }),
  ]);

  const TARJETAS = [
    { label: "Arrendadores", valor: arrendadores, icon: IconGrid, href: "/admin/arrendadores" },
    { label: "Propiedades", valor: propiedades, icon: IconBuilding, href: "/admin/propiedades" },
    {
      label: "Inquilinos activos",
      valor: inquilinosActivos,
      icon: IconUsers,
      nota: `${inquilinosTotal} en total (incluye históricos)`,
      href: "/admin/inquilinos",
    },
    {
      label: "Morosos / sin pagar",
      valor: morosos,
      icon: IconAlert,
      nota: "Con facturas vencidas o marcados como morosos",
      href: "/admin/morosos",
      tono: morosos > 0,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-semibold">Panel de administración</h1>
        <p className="text-[15px] text-ink-soft">
          Vista interna de Acuerdo Alquiler — no visible para arrendadores. Haga clic en una tarjeta para ver
          el detalle.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TARJETAS.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 transition hover:border-primary hover:shadow-[0_12px_30px_-18px_rgba(16,24,38,0.35)]"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                t.tono ? "bg-danger-bg text-danger" : "bg-primary-light text-primary"
              }`}
            >
              <t.icon />
            </div>
            <span className="text-[13px] font-semibold text-ink-faint">{t.label}</span>
            <span className="font-heading text-4xl font-bold">{t.valor}</span>
            {t.nota && <span className="text-xs text-ink-faint">{t.nota}</span>}
            <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-accent">
              Ver detalle
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
