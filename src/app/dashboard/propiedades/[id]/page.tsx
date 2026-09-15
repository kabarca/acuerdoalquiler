import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import {
  crearInquilino,
  actualizarInquilino,
  eliminarInquilino,
  eliminarPropiedad,
  generarFacturaDePrueba,
} from "../../actions";

const inputClass =
  "rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  ATRASADA: "Atrasada",
};

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700",
  PAGADA: "bg-green-50 text-green-700",
  ATRASADA: "bg-red-50 text-red-700",
};

function aInputDate(fecha: Date | null) {
  return fecha ? fecha.toISOString().slice(0, 10) : "";
}

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "inquilino", label: "Inquilino" },
  { id: "facturas", label: "Facturas" },
] as const;

export default async function PropiedadDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;
  const { tab } = await searchParams;
  const tabActivo = TABS.some((t) => t.id === tab) ? tab! : "resumen";

  const propiedad = await prisma.propiedad.findFirst({
    where: { id, arrendadorId: arrendador.id },
    include: {
      inquilinos: {
        include: { facturas: { orderBy: { periodo: "desc" } } },
      },
    },
  });

  if (!propiedad) {
    notFound();
  }

  const inquilino = propiedad.inquilinos[0];
  const hoy = new Date();
  const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const facturaDelMes = inquilino?.facturas.find(
    (f) => f.periodo === periodoActual,
  );

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Propiedades
      </Link>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{propiedad.direccion}</h1>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
              inquilino ? "bg-blue-50 text-primary" : "bg-slate-100 text-muted"
            }`}
          >
            {inquilino ? "Ocupada" : "Vacante"}
          </span>
        </div>
        <form action={eliminarPropiedad}>
          <input type="hidden" name="propiedadId" value={propiedad.id} />
          <button
            type="submit"
            className="text-xs text-muted hover:text-red-600"
          >
            Eliminar propiedad
          </button>
        </form>
      </div>

      <div className="mt-6 flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/propiedades/${propiedad.id}?tab=${t.id}`}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium ${
              tabActivo === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          {tabActivo === "resumen" && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              {inquilino ? (
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted">Inquilino</dt>
                    <dd className="mt-1 font-medium">{inquilino.nombre}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Renta mensual</dt>
                    <dd className="mt-1 font-medium">
                      ₡{inquilino.montoRenta.toString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Día de cobro</dt>
                    <dd className="mt-1 font-medium">
                      {inquilino.diaCobro} de cada mes
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Factura de este mes</dt>
                    <dd className="mt-1 font-medium">
                      {facturaDelMes ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${ESTADO_COLOR[facturaDelMes.estado]}`}
                        >
                          {ESTADO_LABEL[facturaDelMes.estado]}
                        </span>
                      ) : (
                        "Sin generar"
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted">
                  Esta propiedad todavía no tiene inquilino.{" "}
                  <Link
                    href={`/dashboard/propiedades/${propiedad.id}?tab=inquilino`}
                    className="font-medium text-primary hover:underline"
                  >
                    Agregar inquilino →
                  </Link>
                </p>
              )}
            </div>
          )}

          {tabActivo === "inquilino" && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              {inquilino ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{inquilino.nombre}</h3>
                  </div>

                  <h4 className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">
                    Información de contacto
                  </h4>
                  <div className="mt-2 flex flex-col gap-1 text-sm">
                    <span>{inquilino.email}</span>
                    {inquilino.telefono && <span>{inquilino.telefono}</span>}
                  </div>

                  <h4 className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">
                    Periodo de arrendamiento
                  </h4>
                  <table className="mt-2 w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted">
                        <th className="pb-1 font-normal">Inicio</th>
                        <th className="pb-1 font-normal">Fin</th>
                        <th className="pb-1 font-normal">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="pr-4">
                          {inquilino.fechaInicioContrato
                            ? inquilino.fechaInicioContrato.toLocaleDateString("es-CR")
                            : "—"}
                        </td>
                        <td className="pr-4">
                          {inquilino.fechaFinContrato
                            ? inquilino.fechaFinContrato.toLocaleDateString("es-CR")
                            : "Indefinido"}
                        </td>
                        <td>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                            {!inquilino.fechaFinContrato ||
                            inquilino.fechaFinContrato >= hoy
                              ? "Vigente"
                              : "Finalizado"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <details className="mt-5">
                    <summary className="cursor-pointer text-sm font-medium text-primary">
                      Editar inquilino
                    </summary>
                    <form
                      action={actualizarInquilino}
                      className="mt-3 grid grid-cols-2 gap-3"
                    >
                      <input type="hidden" name="inquilinoId" value={inquilino.id} />
                      <input
                        name="nombre"
                        defaultValue={inquilino.nombre}
                        required
                        className={`col-span-2 ${inputClass}`}
                      />
                      <input
                        name="email"
                        type="email"
                        defaultValue={inquilino.email}
                        required
                        className={inputClass}
                      />
                      <input
                        name="telefono"
                        defaultValue={inquilino.telefono ?? ""}
                        placeholder="Teléfono"
                        className={inputClass}
                      />
                      <input
                        name="montoRenta"
                        type="number"
                        step="0.01"
                        defaultValue={inquilino.montoRenta.toString()}
                        required
                        className={inputClass}
                      />
                      <input
                        name="diaCobro"
                        type="number"
                        min={1}
                        max={28}
                        defaultValue={inquilino.diaCobro}
                        required
                        className={inputClass}
                      />
                      <label className="col-span-1 flex flex-col gap-1 text-xs text-muted">
                        Inicio de contrato
                        <input
                          name="fechaInicioContrato"
                          type="date"
                          defaultValue={aInputDate(inquilino.fechaInicioContrato)}
                          className={inputClass}
                        />
                      </label>
                      <label className="col-span-1 flex flex-col gap-1 text-xs text-muted">
                        Fin de contrato
                        <input
                          name="fechaFinContrato"
                          type="date"
                          defaultValue={aInputDate(inquilino.fechaFinContrato)}
                          className={inputClass}
                        />
                      </label>
                      <button
                        type="submit"
                        className="col-span-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
                      >
                        Guardar cambios
                      </button>
                    </form>
                  </details>

                  <form action={eliminarInquilino} className="mt-4">
                    <input type="hidden" name="inquilinoId" value={inquilino.id} />
                    <button
                      type="submit"
                      className="text-xs text-muted hover:text-red-600"
                    >
                      Quitar inquilino
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h3 className="font-medium">Agregar inquilino</h3>
                  <form
                    action={crearInquilino}
                    className="mt-4 grid grid-cols-2 gap-3"
                  >
                    <input type="hidden" name="propiedadId" value={propiedad.id} />
                    <input
                      name="nombre"
                      placeholder="Nombre del inquilino"
                      required
                      className={`col-span-2 ${inputClass}`}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Correo"
                      required
                      className={inputClass}
                    />
                    <input
                      name="telefono"
                      placeholder="Teléfono (opcional)"
                      className={inputClass}
                    />
                    <input
                      name="montoRenta"
                      type="number"
                      step="0.01"
                      placeholder="Monto de renta (₡)"
                      required
                      className={inputClass}
                    />
                    <input
                      name="diaCobro"
                      type="number"
                      min={1}
                      max={28}
                      placeholder="Día de cobro (1-28)"
                      required
                      className={inputClass}
                    />
                    <label className="col-span-1 flex flex-col gap-1 text-xs text-muted">
                      Inicio de contrato (opcional)
                      <input
                        name="fechaInicioContrato"
                        type="date"
                        className={inputClass}
                      />
                    </label>
                    <label className="col-span-1 flex flex-col gap-1 text-xs text-muted">
                      Fin de contrato (opcional)
                      <input
                        name="fechaFinContrato"
                        type="date"
                        className={inputClass}
                      />
                    </label>
                    <button
                      type="submit"
                      className="col-span-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
                    >
                      Guardar inquilino
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {tabActivo === "facturas" && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              {!inquilino ? (
                <p className="text-sm text-muted">
                  Agrega un inquilino primero para poder generar facturas.
                </p>
              ) : (
                <>
                  {!facturaDelMes && (
                    <form action={generarFacturaDePrueba} className="mb-4">
                      <input type="hidden" name="inquilinoId" value={inquilino.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
                      >
                        Generar factura de este mes
                      </button>
                    </form>
                  )}

                  {inquilino.facturas.length === 0 ? (
                    <p className="text-sm text-muted">Sin facturas todavía.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted">
                          <th className="pb-2 font-normal">Periodo</th>
                          <th className="pb-2 font-normal">Monto</th>
                          <th className="pb-2 font-normal">Vence</th>
                          <th className="pb-2 font-normal">Estado</th>
                          <th className="pb-2 font-normal"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquilino.facturas.map((factura) => (
                          <tr key={factura.id} className="border-b border-border last:border-0">
                            <td className="py-2">{factura.periodo}</td>
                            <td className="py-2">₡{factura.monto.toString()}</td>
                            <td className="py-2">
                              {factura.fechaVencimiento.toLocaleDateString("es-CR")}
                            </td>
                            <td className="py-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${ESTADO_COLOR[factura.estado]}`}
                              >
                                {ESTADO_LABEL[factura.estado]}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              <Link
                                href={`/pagar/${factura.id}`}
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                Ver →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Siguientes pasos</h2>
          {!inquilino && (
            <Link
              href={`/dashboard/propiedades/${propiedad.id}?tab=inquilino`}
              className="rounded-xl border border-border bg-surface p-4 text-sm shadow-sm hover:border-primary/40"
            >
              Agregar inquilino
            </Link>
          )}
          {inquilino && !facturaDelMes && (
            <Link
              href={`/dashboard/propiedades/${propiedad.id}?tab=facturas`}
              className="rounded-xl border border-border bg-surface p-4 text-sm shadow-sm hover:border-primary/40"
            >
              Generar factura de este mes
            </Link>
          )}
          {inquilino && facturaDelMes && (
            <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted shadow-sm">
              Todo al día por ahora.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
