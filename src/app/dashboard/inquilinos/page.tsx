import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function InquilinosPage() {
  const arrendador = await getArrendadorActual();

  const inquilinos = await prisma.inquilino.findMany({
    where: { propiedad: { arrendadorId: arrendador.id } },
    include: { propiedad: true },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="flex flex-col gap-7 px-11 py-9">
      <div>
        <h1 className="text-2xl font-semibold">Inquilinos</h1>
        <p className="mt-1 text-[14.5px] text-ink-soft">
          {inquilinos.length} {inquilinos.length === 1 ? "inquilino registrado" : "inquilinos registrados"}.
        </p>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
        {inquilinos.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">
            Todavía no ha registrado inquilinos.{" "}
            <Link href="/dashboard/propiedades/nueva" className="font-semibold text-accent">
              Registre uno →
            </Link>
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[12.5px] font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-5 py-3">Inquilino</th>
                <th className="px-5 py-3">Propiedad</th>
                <th className="px-5 py-3">Contacto</th>
                <th className="px-5 py-3">Renta</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {inquilinos.map((inquilino) => (
                <tr key={inquilino.id} className="border-t border-border text-[14.5px]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                        {iniciales(inquilino.nombre)}
                      </div>
                      <span className="font-semibold">{inquilino.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{inquilino.propiedad.direccion}</td>
                  <td className="px-5 py-4 text-ink-soft">
                    {inquilino.email}
                    {inquilino.telefono ? ` · ${inquilino.telefono}` : ""}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    ₡{Number(inquilino.montoRenta).toLocaleString("es-CR")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/propiedades/${inquilino.propiedadId}`}
                      className="font-semibold text-accent"
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
    </div>
  );
}
