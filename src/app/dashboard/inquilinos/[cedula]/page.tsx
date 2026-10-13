import Link from "next/link";
import { notFound } from "next/navigation";
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

function rango(inicio: Date | null, fin: Date | null, activo: boolean) {
  const opts: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  const desde = inicio ? inicio.toLocaleDateString("es-CR", opts) : "—";
  if (activo) return `Desde ${desde}`;
  const hasta = fin ? fin.toLocaleDateString("es-CR", opts) : "—";
  return `${desde} – ${hasta}`;
}

export default async function PerfilInquilinoPage({
  params,
}: {
  params: Promise<{ cedula: string }>;
}) {
  await getArrendadorActual();
  const { cedula } = await params;
  const cedulaDecodificada = decodeURIComponent(cedula);

  const filas = await prisma.inquilino.findMany({
    where: { cedula: cedulaDecodificada, compartirHistorial: true },
    include: {
      propiedad: { include: { arrendador: true } },
      facturas: true,
      disputas: true,
    },
    orderBy: { fechaInicioContrato: "desc" },
  });

  if (filas.length === 0) {
    notFound();
  }

  const nombre = filas[0].nombre;
  const disputasTotales = filas.reduce((n, f) => n + f.disputas.length, 0);
  const disputaActivaGlobal = filas.some((f) => f.disputas.some((d) => d.estado === "ABIERTA"));

  const actuales = filas.filter((f) => f.activo);
  const anteriores = filas.filter((f) => !f.activo);

  return (
    <div className="flex flex-col gap-5.5 px-11 py-8">
      <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-faint">
        <Link href="/dashboard/inquilinos" className="hover:text-ink">Inquilinos</Link>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        <span className="text-ink">{nombre}</span>
      </div>

      <div className="flex flex-col gap-5.5 lg:flex-row">
        {/* Left: identity & reputation */}
        <div className="flex w-full flex-col gap-4.5 lg:w-[340px] lg:shrink-0">
          <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-border bg-surface p-6.5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-[22px] font-bold text-primary">
              {iniciales(nombre)}
            </div>
            <div>
              <p className="text-lg font-bold">{nombre}</p>
              <p className="mt-0.5 text-[13px] text-ink-faint">Cédula {enmascarar(cedulaDecodificada)}</p>
            </div>
            {disputaActivaGlobal ? (
              <span className="rounded-full bg-warning-bg px-3.5 py-1.5 text-[13px] font-bold text-warning">
                Disputa activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3.5 py-1.5 text-[13px] font-bold text-success">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                Buena paga
              </span>
            )}
            <div className="flex w-full justify-center gap-5 border-t border-border pt-3.5">
              <div className="text-center">
                <p className="font-heading text-xl font-bold">{filas.length}</p>
                <p className="text-xs text-ink-faint">Alquileres previos</p>
              </div>
              <div className="text-center">
                <p className={`font-heading text-xl font-bold ${disputasTotales > 0 ? "text-warning" : "text-success"}`}>
                  {disputasTotales}
                </p>
                <p className="text-xs text-ink-faint">Disputas registradas</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl bg-primary-light p-5.5">
            <div className="flex items-center gap-2 text-[14px] font-bold text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>
              Referencia completa
            </div>
            <p className="text-[13px] leading-relaxed text-primary-dark">
              Incluye verificación de identidad y el detalle mes a mes de sus pagos anteriores.
            </p>
            <button
              type="button"
              disabled
              className="mt-1 cursor-not-allowed rounded-[9px] bg-primary/50 py-2.75 text-center text-[13.5px] font-bold text-white"
              title="Todavía no está disponible — falta conectar el cobro de este servicio"
            >
              Solicitar por ₡8.000
            </button>
          </div>

          <p className="px-1 text-[12.5px] leading-relaxed text-ink-faint">
            {nombre.split(" ")[0]} autorizó compartir su historial de pago con arrendadores
            verificados en Acuerdo Alquiler.
          </p>
        </div>

        {/* Right: rental history */}
        <div className="flex flex-1 flex-col gap-4">
          {anteriores.length > 0 && (
            <>
              <p className="text-base font-bold">Historial de alquileres</p>
              {anteriores.map((f) => {
                const puntuales = f.facturas.filter((fa) => fa.estado === "PAGADA").length;
                const total = f.facturas.filter((fa) => fa.estado === "PAGADA" || fa.estado === "ATRASADA").length;
                return (
                  <div key={f.id} className="flex items-center justify-between rounded-2xl border border-border p-5">
                    <div>
                      <p className="text-[15px] font-bold">{f.propiedad.direccion}</p>
                      <p className="mt-0.5 text-[13px] text-ink-faint">
                        {rango(f.fechaInicioContrato, f.fechaFinContrato, false)} · Arrendador verificado en Acuerdo Alquiler
                      </p>
                    </div>
                    <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-bold text-success">
                      Pagos puntuales ({puntuales}/{total || puntuales} meses)
                    </span>
                  </div>
                );
              })}
            </>
          )}

          {actuales.length > 0 && (
            <>
              <p className="mt-2 text-base font-bold">Alquiler actual</p>
              {actuales.map((f) => {
                const disputaActiva = f.disputas.some((d) => d.estado === "ABIERTA");
                return (
                  <div
                    key={f.id}
                    className={`flex items-center justify-between rounded-2xl border p-5 ${
                      disputaActiva ? "border-warning bg-warning-bg" : "border-border"
                    }`}
                  >
                    <div>
                      <p className="text-[15px] font-bold">{f.propiedad.direccion}</p>
                      <p className="mt-0.5 text-[13px] text-ink-soft">
                        {rango(f.fechaInicioContrato, null, true)} · Arrendador: {f.propiedad.arrendador.nombre}
                      </p>
                    </div>
                    {disputaActiva ? (
                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-warning">
                        Disputa en curso
                      </span>
                    ) : (
                      <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-bold text-success">
                        Al día
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}

          <div className="mt-auto flex items-center gap-3 rounded-[14px] border border-border bg-surface px-5 py-4.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="8" x2="12" y2="8.1"/><line x1="12" y1="11" x2="12" y2="16"/></svg>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Una disputa activa no cambia el estado de reputación hasta que el arrendador la
              resuelva y la confirme con un motivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
