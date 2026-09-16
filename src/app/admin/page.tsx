import { prisma } from "@/lib/prisma";
import { IconBuilding, IconUsers, IconGrid } from "@/lib/icons";

export default async function AdminPage() {
  const [arrendadores, propiedades, inquilinosActivos, inquilinosTotal] = await Promise.all([
    prisma.arrendador.count(),
    prisma.propiedad.count(),
    prisma.inquilino.count({ where: { activo: true } }),
    prisma.inquilino.count(),
  ]);

  const TARJETAS = [
    { label: "Arrendadores", valor: arrendadores, icon: IconGrid },
    { label: "Propiedades", valor: propiedades, icon: IconBuilding },
    { label: "Inquilinos activos", valor: inquilinosActivos, icon: IconUsers, nota: `${inquilinosTotal} en total (incluye históricos)` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-semibold">Panel de administración</h1>
        <p className="text-[15px] text-ink-soft">
          Vista interna de Rentia — no visible para arrendadores.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {TARJETAS.map((t) => (
          <div key={t.label} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-light text-primary">
              <t.icon />
            </div>
            <span className="text-[13px] font-semibold text-ink-faint">{t.label}</span>
            <span className="font-heading text-4xl font-bold">{t.valor}</span>
            {t.nota && <span className="text-xs text-ink-faint">{t.nota}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
