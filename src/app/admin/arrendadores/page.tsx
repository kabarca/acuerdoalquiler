import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminArrendadoresPage() {
  const arrendadores = await prisma.arrendador.findMany({
    include: { _count: { select: { propiedades: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Link href="/admin" className="text-[13.5px] font-semibold text-accent">
        ← Volver al panel
      </Link>

      <div className="mt-3 flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold">Arrendadores</h1>
        <p className="text-[14.5px] text-ink-soft">
          {arrendadores.length} {arrendadores.length === 1 ? "cuenta registrada" : "cuentas registradas"} en Acuerdo Alquiler.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-border bg-surface">
        {arrendadores.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">No hay arrendadores registrados todavía.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-4.5 py-3">Nombre</th>
                <th className="px-4.5 py-3">Correo</th>
                <th className="px-4.5 py-3">Teléfono</th>
                <th className="px-4.5 py-3">Propiedades</th>
                <th className="px-4.5 py-3">Cuenta bancaria</th>
                <th className="px-4.5 py-3">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {arrendadores.map((a) => (
                <tr key={a.id} className="border-t border-border text-sm">
                  <td className="px-4.5 py-3.5 font-semibold">
                    {a.nombre}
                    {a.esAdmin && (
                      <span className="ml-2 rounded-full bg-primary-light px-2 py-0.5 text-[10.5px] font-bold text-primary uppercase">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4.5 py-3.5 text-ink-soft">{a.email}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">{a.telefono ?? "—"}</td>
                  <td className="px-4.5 py-3.5">{a._count.propiedades}</td>
                  <td className="px-4.5 py-3.5 text-ink-soft">
                    {a.tipoCuentaBancaria === "INTERNACIONAL" ? "Internacional" : "Nacional"}
                  </td>
                  <td className="px-4.5 py-3.5 text-ink-soft">
                    {a.creadoEn.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })}
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
