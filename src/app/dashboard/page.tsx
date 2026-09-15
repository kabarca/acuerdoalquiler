import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { IconPlus } from "@/lib/icons";

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

  const filas = propiedades.flatMap((p) =>
    p.inquilinos.map((inquilino) => ({
      propiedad: p.direccion,
      propiedadId: p.id,
      inquilino: inquilino.nombre,
      monto: inquilino.montoRenta.toString(),
      factura: inquilino.facturas[0] ?? null,
    })),
  );

  const cobradoEsteMes = filas
    .filter((f) => f.factura?.estado === "PAGADA")
    .reduce((sum, f) => sum + Number(f.factura!.monto), 0);
  const facturado = filas.reduce((sum, f) => sum + Number(f.monto), 0);
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-surface px-6 py-5.5">
          <span className="text-[13px] font-semibold text-ink-faint">Cobrado este mes</span>
          <span className="font-heading text-[26px] font-bold">
            ₡{cobradoEsteMes.toLocaleString("es-CR")}
          </span>
          <span className="text-[12.5px] font-semibold text-ink-faint">
            de ₡{facturado.toLocaleString("es-CR")} facturados
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
                  <td className="px-5 py-4 font-semibold">₡{Number(f.monto).toLocaleString("es-CR")}</td>
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
