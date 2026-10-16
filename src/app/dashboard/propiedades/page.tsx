import { formatearMonto } from "@/lib/moneda";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { IconPlus, IconBuilding } from "@/lib/icons";

const TIPO_LABEL: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  LOCAL_COMERCIAL: "Local comercial",
};

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

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function PropiedadesPage() {
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

  return (
    <div className="flex flex-col gap-7 px-11 py-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis propiedades</h1>
          <p className="mt-1 text-[14.5px] text-ink-soft">
            {propiedades.length}{" "}
            {propiedades.length === 1 ? "propiedad registrada" : "propiedades registradas"}
          </p>
        </div>
        <Link
          href="/dashboard/propiedades/nueva"
          className="flex items-center gap-2.5 rounded-[10px] bg-primary px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          <IconPlus />
          Agregar propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
        {propiedades.map((propiedad) => {
          const inquilino = propiedad.inquilinos[0];
          const factura = inquilino?.facturas[0];
          const estado = factura?.estado ?? null;

          return (
            <Link
              key={propiedad.id}
              href={`/dashboard/propiedades/${propiedad.id}`}
              className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5.5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9.5 w-9.5 items-center justify-center rounded-[10px] bg-primary-light text-primary">
                  <IconBuilding />
                </div>
                {estado ? (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_TONO[estado]}`}>
                    {ESTADO_LABEL[estado]}
                  </span>
                ) : (
                  <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-bold text-ink-faint">
                    Sin factura
                  </span>
                )}
              </div>
              <div>
                <p className="text-base font-bold">{propiedad.direccion}</p>
                <p className="mt-0.5 text-[13px] text-ink-faint">
                  {propiedad.canton ? `${propiedad.canton} · ` : ""}
                  {TIPO_LABEL[propiedad.tipo]}
                </p>
              </div>
              {inquilino ? (
                <div className="flex items-center gap-2 border-t border-border pt-2.5">
                  <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-primary-light text-[12px] font-bold text-primary">
                    {iniciales(inquilino.nombre)}
                  </div>
                  <span className="text-[13.5px] text-ink-soft">{inquilino.nombre}</span>
                </div>
              ) : (
                <div className="border-t border-border pt-2.5 text-[13.5px] text-ink-faint">
                  Sin inquilino
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-heading text-[17px] font-bold">
                  {inquilino ? formatearMonto(inquilino.montoRenta, inquilino.moneda) : "—"}
                  <span className="text-[12.5px] font-medium text-ink-faint">/mes</span>
                </span>
                <span className="text-[13.5px] font-semibold text-accent">Ver detalle</span>
              </div>
            </Link>
          );
        })}

        <Link
          href="/dashboard/propiedades/nueva"
          className="flex min-h-[200px] flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-border text-ink-faint hover:border-primary/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
            <IconPlus />
          </div>
          <span className="text-sm font-semibold text-ink-soft">Agregar otra propiedad</span>
        </Link>
      </div>
    </div>
  );
}
