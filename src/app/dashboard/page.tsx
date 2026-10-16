import { formatearMonto, sumarPorMoneda } from "@/lib/moneda";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { IconPlus } from "@/lib/icons";
import { hoyCostaRica, periodoDe } from "@/lib/facturacion";
import { AvisoFacturaNoEnviada } from "@/components/aviso-factura";
import { BotonCopiarEnlace } from "@/components/boton-copiar-enlace";

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagado",
  ATRASADA: "Vencido",
  EN_REVISION: "En revisión",
};

const ESTADO_TONO: Record<string, string> = {
  PENDIENTE: "bg-warning-bg text-warning",
  PAGADA: "bg-success-bg text-success",
  ATRASADA: "bg-danger-bg text-danger",
  EN_REVISION: "bg-primary-light text-primary",
};

function haceSieteDias() {
  return new Date(Date.now() - 7 * 86_400_000);
}

export default async function PanelPage() {
  const arrendador = await getArrendadorActual();

  const propiedades = await prisma.propiedad.findMany({
    where: { arrendadorId: arrendador.id },
    include: {
      inquilinos: {
        where: { activo: true },
        include: { facturas: { orderBy: { periodo: "desc" }, take: 1 } },
      },
    },
    orderBy: { creadoEn: "desc" },
  });

  // Avisos: lo que el arrendador debe saber o resolver. Se calculan a partir
  // del estado real (no de un "mensaje" guardado), así que si un día el cron
  // no corre, el aviso aparece igual en cuanto pasa el día de envío.
  const hoy = hoyCostaRica();
  const facturasPorEnviar = await prisma.factura.findMany({
    where: {
      periodo: periodoDe(hoy.anio, hoy.mes),
      estado: "PENDIENTE",
      facturaEnviadaEn: null,
      inquilino: { activo: true, propiedad: { arrendadorId: arrendador.id } },
    },
    include: { inquilino: { include: { propiedad: true } } },
  });
  const facturasSinEnviar = facturasPorEnviar.filter(
    (f) => hoy.dia >= Math.max(f.inquilino.diaEnvio, f.inquilino.diaGeneracion),
  );

  const verificaciones = await prisma.verificacionIdentidad.findMany({
    where: {
      inquilino: { activo: true, propiedad: { arrendadorId: arrendador.id } },
      OR: [
        { estado: "COMPLETADA", completadoEn: { gte: haceSieteDias() } },
        { estado: "PENDIENTE", errorEnvio: { not: null } },
      ],
    },
    include: { inquilino: { include: { propiedad: true } } },
    orderBy: { creadoEn: "desc" },
  });
  const hayAvisos = facturasSinEnviar.length > 0 || verificaciones.length > 0;

  const filas = propiedades.flatMap((p) =>
    p.inquilinos.map((inquilino) => ({
      propiedad: p.direccion,
      propiedadId: p.id,
      inquilino: inquilino.nombre,
      monto: inquilino.montoRenta.toString(),
      moneda: inquilino.moneda,
      factura: inquilino.facturas[0] ?? null,
    })),
  );

  const cobradoEsteMes = sumarPorMoneda(
    filas
      .filter((f) => f.factura?.estado === "PAGADA")
      .map((f) => ({ monto: f.factura!.monto, moneda: f.factura!.moneda })),
  );
  const facturado = sumarPorMoneda(filas.map((f) => ({ monto: f.monto, moneda: f.moneda })));
  const pendientes = filas.filter((f) => f.factura?.estado === "PENDIENTE").length;
  const vencidos = filas.filter((f) => f.factura?.estado === "ATRASADA").length;

  return (
    <div className="flex flex-col gap-7 px-11 py-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hola, {arrendador.nombre.split(" ")[0]}</h1>
          <p className="mt-1 text-[14.5px] text-ink-soft">
            Esto es lo que sucede con sus propiedades hoy.
          </p>
        </div>
        <Link
          href="/dashboard/propiedades/nueva"
          className="flex items-center gap-3 rounded-[10px] bg-primary px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          <IconPlus />
          Nueva propiedad
        </Link>
      </div>

      {hayAvisos && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[13px] font-bold tracking-wide text-ink-faint uppercase">Avisos</h2>

          {facturasSinEnviar.map((f) => (
            <AvisoFacturaNoEnviada
              key={f.id}
              facturaId={f.id}
              inquilino={f.inquilino.nombre}
              direccion={f.inquilino.propiedad.direccion}
              motivo={f.errorEnvio}
            />
          ))}

          {verificaciones.map((v) =>
            v.estado === "COMPLETADA" ? (
              <Link
                key={v.id}
                href={`/dashboard/verificaciones/${v.id}`}
                className={`flex items-center justify-between rounded-xl border px-4.5 py-4 ${
                  v.rostrosCoinciden
                    ? "border-success bg-success-bg"
                    : "border-warning bg-warning-bg"
                }`}
              >
                <div>
                  <p className={`text-[14px] font-bold ${v.rostrosCoinciden ? "text-success" : "text-warning"}`}>
                    {v.rostrosCoinciden
                      ? `${v.inquilino.nombre} ya verificó su identidad`
                      : `${v.inquilino.nombre} envió su verificación — revísela`}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-ink-soft">{v.inquilino.propiedad.direccion}</p>
                </div>
                <span className="text-[13px] font-semibold text-ink-soft">Ver →</span>
              </Link>
            ) : (
              <div
                key={v.id}
                className="flex flex-col gap-3 rounded-xl border border-warning bg-warning-bg px-4.5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[14px] font-bold text-warning">
                    El enlace de verificación de {v.inquilino.nombre} no se pudo enviar
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-ink-soft">
                    {v.inquilino.propiedad.direccion} · {v.errorEnvio}
                  </p>
                </div>
                <BotonCopiarEnlace ruta={`/verificar/${v.token}`} etiqueta="Copiar enlace de verificación" />
              </div>
            ),
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-surface px-6 py-5.5">
          <span className="text-[13px] font-semibold text-ink-faint">Cobrado este mes</span>
          <span className="font-heading text-[26px] font-bold">
            {cobradoEsteMes}
          </span>
          <span className="text-[12.5px] font-semibold text-ink-faint">
            de {facturado} facturados
          </span>
        </div>
        <div className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-surface px-6 py-5.5">
          <span className="text-[13px] font-semibold text-ink-faint">Pagos pendientes</span>
          <span className="font-heading text-[26px] font-bold">{pendientes}</span>
          <span className="text-[12.5px] font-semibold text-warning">
            {pendientes > 0 ? "Requiere seguimiento" : "Todo al día"}
          </span>
        </div>
        <div className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-surface px-6 py-5.5">
          <span className="text-[13px] font-semibold text-ink-faint">Pagos vencidos</span>
          <span className="font-heading text-[26px] font-bold text-danger">{vencidos}</span>
          <span className="text-[12.5px] font-semibold text-danger">
            {vencidos > 0 ? "Requiere su atención" : "Sin atrasos"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
        <div className="px-5 pt-5 pb-1 text-[15.5px] font-bold">Propiedades e inquilinos</div>
        {filas.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">
            Todavía no tiene propiedades registradas.{" "}
            <Link href="/dashboard/propiedades/nueva" className="font-semibold text-accent">
              Registre la primera →
            </Link>
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[12.5px] font-bold tracking-wide text-ink-faint uppercase">
                <th className="px-5 pb-3 font-bold">Propiedad</th>
                <th className="px-5 pb-3 font-bold">Inquilino</th>
                <th className="px-5 pb-3 font-bold">Monto</th>
                <th className="px-5 pb-3 font-bold">Vencimiento</th>
                <th className="px-5 pb-3 font-bold">Estado</th>
                <th className="px-5 pb-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-t border-border text-[14.5px]">
                  <td className="px-5 py-4 font-semibold">{f.propiedad}</td>
                  <td className="px-5 py-4 text-ink-soft">{f.inquilino}</td>
                  <td className="px-5 py-4 font-semibold">{formatearMonto(f.monto, f.moneda)}</td>
                  <td className="px-5 py-4 text-ink-soft">
                    {f.factura ? f.factura.fechaVencimiento.toLocaleDateString("es-CR") : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {f.factura ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_TONO[f.factura.estado]}`}>
                        {ESTADO_LABEL[f.factura.estado]}
                      </span>
                    ) : (
                      <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-bold text-ink-faint">
                        Sin factura
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/dashboard/propiedades/${f.propiedadId}`} className="font-semibold text-accent">
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
