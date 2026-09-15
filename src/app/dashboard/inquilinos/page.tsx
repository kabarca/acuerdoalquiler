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

function enmascarar(cedula: string) {
  const partes = cedula.split("-");
  if (partes.length < 2) return cedula;
  return `${partes[0]}-${partes[1]}-••••`;
}

export default async function BuscarInquilinoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await getArrendadorActual();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const coincidencias = query
    ? await prisma.inquilino.findMany({
        where: {
          compartirHistorial: true,
          cedula: { not: null },
          OR: [
            { nombre: { contains: query, mode: "insensitive" } },
            { cedula: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { facturas: true, disputas: { where: { estado: "ABIERTA" } } },
        orderBy: { nombre: "asc" },
      })
    : [];

  // Agrupar por cédula: la misma persona puede tener varias filas de
  // inquilino (una por cada arrendador con el que ha alquilado).
  const porCedula = new Map<string, typeof coincidencias>();
  for (const c of coincidencias) {
    const lista = porCedula.get(c.cedula!) ?? [];
    lista.push(c);
    porCedula.set(c.cedula!, lista);
  }

  const resultados = [...porCedula.entries()].map(([cedula, filas]) => {
    const disputaActiva = filas.some((f) => f.disputas.length > 0);
    const facturas = filas.flatMap((f) => f.facturas);
    const atrasos = facturas.some((f) => f.estado === "ATRASADA");
    const estado = disputaActiva ? "disputa" : atrasos ? "atrasos" : "buena";
    return {
      cedula,
      nombre: filas[0].nombre,
      alquileres: filas.length,
      estado,
    };
  });

  return (
    <div className="flex flex-col gap-7 px-11 py-9">
      <div>
        <h1 className="text-2xl font-semibold">Buscar inquilino</h1>
        <p className="mt-1 text-[14.5px] text-ink-soft">
          Consulte el historial de pago de un posible inquilino antes de alquilarle.
        </p>
      </div>

      <form method="GET" className="relative">
        <input
          name="q"
          defaultValue={query}
          placeholder="Nombre o cédula"
          className="w-full rounded-[10px] border-[1.5px] border-border bg-surface py-3.25 pr-4 pl-11.5 text-[15px] outline-none focus:border-primary"
        />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute top-1/2 left-4 -translate-y-1/2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></svg>
      </form>

      {query && (
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold tracking-wide text-ink-faint uppercase">
            {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
          </span>

          {resultados.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No se encontraron inquilinos que coincidan y hayan autorizado compartir su historial.
            </p>
          ) : (
            resultados.map((r) => (
              <div
                key={r.cedula}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-[15px] font-bold text-primary">
                  {iniciales(r.nombre)}
                </div>
                <div className="flex-1">
                  <p className="text-[15.5px] font-bold">{r.nombre}</p>
                  <p className="mt-0.5 text-[13px] text-ink-faint">
                    Cédula {enmascarar(r.cedula)} · {r.alquileres}{" "}
                    {r.alquileres === 1 ? "alquiler registrado" : "alquileres registrados"} en Rentia
                  </p>
                </div>
                {r.estado === "disputa" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1.5 text-xs font-bold text-warning">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.5 20.5h19L12 4Z"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="12" y1="17.5" x2="12" y2="17.6"/></svg>
                    Disputa activa
                  </span>
                ) : r.estado === "atrasos" ? (
                  <span className="rounded-full bg-warning-bg px-2.5 py-1.5 text-xs font-bold text-warning">
                    Atrasos registrados
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1.5 text-xs font-bold text-success">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                    Buena paga
                  </span>
                )}
                <Link
                  href={`/dashboard/inquilinos/${encodeURIComponent(r.cedula)}`}
                  className="ml-2.5 text-[13.5px] font-semibold text-accent"
                >
                  Ver perfil
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 rounded-[14px] border border-border bg-surface px-5.5 py-4.5">
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[9px] bg-primary-light text-primary">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="8" x2="12" y2="8.1"/><line x1="12" y1="11" x2="12" y2="16"/></svg>
        </div>
        <p className="text-[13.5px] text-ink-soft">
          Los resultados muestran solo inquilinos que autorizaron compartir su historial en Rentia.
        </p>
      </div>
    </div>
  );
}
