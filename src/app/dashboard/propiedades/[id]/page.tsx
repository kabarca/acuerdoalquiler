import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import {
  crearInquilino,
  actualizarInquilino,
  eliminarPropiedad,
  generarFacturaDePrueba,
  marcarFacturaAtrasadaDePrueba,
  abrirDisputaDePrueba,
  invitarInquilino,
  enviarVerificacionIdentidad,
} from "../../actions";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary";

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

const METODO_LABEL: Record<string, string> = {
  TRANSFERENCIA: "Transferencia bancaria",
  DEBITO: "Tarjeta débito",
  CREDITO: "Tarjeta crédito",
};

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function PropiedadDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;

  const propiedad = await prisma.propiedad.findFirst({
    where: { id, arrendadorId: arrendador.id },
    include: {
      inquilinos: {
        where: { activo: true },
        include: {
          facturas: { orderBy: { periodo: "desc" }, include: { disputa: true } },
          verificacionIdentidad: true,
        },
      },
    },
  });

  if (!propiedad) {
    notFound();
  }

  const inquilino = propiedad.inquilinos[0];
  const hoy = new Date();
  const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const facturaDelMes = inquilino?.facturas.find((f) => f.periodo === periodoActual);
  const disputaActiva = facturaDelMes?.disputa && facturaDelMes.disputa.estado === "ABIERTA"
    ? facturaDelMes.disputa
    : null;

  return (
    <div className="flex flex-col gap-5.5 px-11 py-8">
      <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-faint">
        <Link href="/dashboard/propiedades" className="hover:text-ink">Propiedades</Link>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        <span className="text-ink">{propiedad.direccion}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-semibold">{propiedad.direccion}</h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {propiedad.canton ? `${propiedad.canton} · ` : ""}
            {TIPO_LABEL[propiedad.tipo]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {facturaDelMes && (
            <span className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold ${ESTADO_TONO[facturaDelMes.estado]}`}>
              {ESTADO_LABEL[facturaDelMes.estado]} · vence{" "}
              {facturaDelMes.fechaVencimiento.toLocaleDateString("es-CR", { day: "numeric", month: "short" })}
            </span>
          )}
          <form action={eliminarPropiedad}>
            <input type="hidden" name="propiedadId" value={propiedad.id} />
            <button type="submit" className="text-xs text-ink-faint hover:text-danger">
              Eliminar propiedad
            </button>
          </form>
        </div>
      </div>

      {disputaActiva && (
        <Link
          href={`/dashboard/disputas/${disputaActiva.id}`}
          className="flex items-center justify-between rounded-2xl border border-warning bg-warning-bg px-5.5 py-4"
        >
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.5 20.5h19L12 4Z"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="12" y1="17.5" x2="12" y2="17.6"/></svg>
            <span className="text-[14.5px] font-semibold text-warning">
              Hay una disputa de pago abierta con {inquilino?.nombre}
            </span>
          </div>
          <span className="text-[13.5px] font-semibold text-warning">Revisar →</span>
        </Link>
      )}

      <div className="flex flex-col gap-5.5 lg:flex-row">
        {/* Left: tenant & payment setup */}
        <div className="flex w-full flex-col gap-4.5 lg:w-[340px] lg:shrink-0">
          {inquilino ? (
            <>
              <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                    {iniciales(inquilino.nombre)}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold">{inquilino.nombre}</p>
                    <p className="text-[12.5px] text-ink-faint">
                      {inquilino.email}
                      {inquilino.telefono ? ` · ${inquilino.telefono}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 border-t border-border pt-2.5 text-[13.5px]">
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Monto mensual</span>
                    <span className="font-semibold">₡{Number(inquilino.montoRenta).toLocaleString("es-CR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Día de vencimiento</span>
                    <span className="font-semibold">Día {inquilino.diaCobro}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Método guardado</span>
                    <span className="font-semibold">
                      {inquilino.metodoPagoPreferido ? METODO_LABEL[inquilino.metodoPagoPreferido] : "Sin configurar"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Inicio de contrato</span>
                    <span className="font-semibold">
                      {inquilino.fechaInicioContrato
                        ? inquilino.fechaInicioContrato.toLocaleDateString("es-CR")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Fin de contrato</span>
                    <span className="font-semibold">
                      {inquilino.fechaFinContrato
                        ? inquilino.fechaFinContrato.toLocaleDateString("es-CR")
                        : "Indefinido"}
                    </span>
                  </div>
                </div>

                <details className="mt-1">
                  <summary className="cursor-pointer text-[13.5px] font-semibold text-accent">
                    Editar inquilino
                  </summary>
                  <form action={actualizarInquilino} className="mt-3.5 flex flex-col gap-3">
                    <input type="hidden" name="inquilinoId" value={inquilino.id} />
                    <input name="nombre" defaultValue={inquilino.nombre} required className={inputClass} />
                    <input name="email" type="email" defaultValue={inquilino.email} required className={inputClass} />
                    <input name="telefono" defaultValue={inquilino.telefono ?? ""} placeholder="Teléfono" className={inputClass} />
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
                    <button
                      type="submit"
                      className="rounded-[10px] bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      Guardar cambios
                    </button>
                  </form>
                </details>

                <Link
                  href={`/dashboard/propiedades/${propiedad.id}/quitar-inquilino`}
                  className="text-xs text-ink-faint hover:text-danger"
                >
                  Quitar inquilino
                </Link>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5.5">
                <p className="text-[14.5px] font-bold">Invitar a configurar el pago</p>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  Envíe a su inquilino un enlace para que registre su método de pago directamente.
                </p>
                <form action={invitarInquilino} className="flex flex-col gap-2.5">
                  <input type="hidden" name="propiedadId" value={propiedad.id} />
                  <input type="hidden" name="montoRenta" value={inquilino.montoRenta.toString()} />
                  <input type="hidden" name="diaCobro" value={inquilino.diaCobro} />
                  <input type="hidden" name="email" value={inquilino.email} />
                  <button
                    type="submit"
                    className="rounded-[9px] bg-primary py-2.75 text-center text-[13.5px] font-bold text-white hover:bg-primary-dark"
                  >
                    {inquilino.invitacionEnviadaEn ? "Reenviar invitación" : "Enviar invitación"}
                  </button>
                </form>
                {inquilino.invitacionEnviadaEn && (
                  <p className="text-[12px] text-ink-faint">
                    Enviada el {inquilino.invitacionEnviadaEn.toLocaleDateString("es-CR")}.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5.5">
                <div className="flex items-center justify-between">
                  <p className="text-[14.5px] font-bold">Verificación de identidad</p>
                  {inquilino.verificacionIdentidad?.estado === "COMPLETADA" ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        inquilino.verificacionIdentidad.rostrosCoinciden
                          ? "bg-success-bg text-success"
                          : "bg-danger-bg text-danger"
                      }`}
                    >
                      {inquilino.verificacionIdentidad.rostrosCoinciden ? "Rostros coinciden" : "No coinciden"}
                    </span>
                  ) : inquilino.verificacionIdentidad?.estado === "PENDIENTE" ? (
                    <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-bold text-warning">
                      Pendiente
                    </span>
                  ) : null}
                </div>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  Envíele un enlace para que confirme su identidad desde el celular: foto de cédula + selfie,
                  sin descargar nada.
                </p>
                {inquilino.verificacionIdentidad?.estado === "COMPLETADA" && (
                  <Link
                    href={`/dashboard/verificaciones/${inquilino.verificacionIdentidad.id}`}
                    className="text-[13px] font-semibold text-accent"
                  >
                    Ver fotos y resultado →
                  </Link>
                )}
                <form action={enviarVerificacionIdentidad}>
                  <input type="hidden" name="propiedadId" value={propiedad.id} />
                  <button
                    type="submit"
                    className="w-full rounded-[9px] border-[1.5px] border-border py-2.75 text-center text-[13.5px] font-bold text-ink-soft hover:border-primary hover:text-primary"
                  >
                    {inquilino.verificacionIdentidad ? "Reenviar enlace" : "Enviar enlace de verificación"}
                  </button>
                </form>
              </div>

              {!facturaDelMes ? (
                <form action={generarFacturaDePrueba} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5.5">
                  <p className="text-[14.5px] font-bold">Factura de este mes</p>
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    Todavía no se ha generado. Puede crearla ahora para ver el flujo completo.
                  </p>
                  <input type="hidden" name="inquilinoId" value={inquilino.id} />
                  <button
                    type="submit"
                    className="rounded-[9px] bg-primary py-2.75 text-center text-[13.5px] font-bold text-white hover:bg-primary-dark"
                  >
                    Generar factura
                  </button>
                </form>
              ) : facturaDelMes.estado === "PENDIENTE" ? (
                <form action={marcarFacturaAtrasadaDePrueba} className="flex flex-col gap-2 rounded-2xl border border-dashed border-border p-5">
                  <p className="text-[12.5px] text-ink-faint">
                    Prueba: simular que se pasó de la fecha de vencimiento.
                  </p>
                  <input type="hidden" name="facturaId" value={facturaDelMes.id} />
                  <button type="submit" className="text-[13px] font-semibold text-accent text-left">
                    Marcar como vencida (prueba) →
                  </button>
                </form>
              ) : facturaDelMes.estado === "ATRASADA" && !disputaActiva ? (
                <form action={abrirDisputaDePrueba} className="flex flex-col gap-2 rounded-2xl border border-dashed border-border p-5">
                  <p className="text-[12.5px] text-ink-faint">
                    Prueba: simular que el atraso escaló a una disputa.
                  </p>
                  <input type="hidden" name="facturaId" value={facturaDelMes.id} />
                  <button type="submit" className="text-[13px] font-semibold text-accent text-left">
                    Abrir disputa (prueba) →
                  </button>
                </form>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
              <p className="text-[15px] font-bold">Agregar inquilino</p>
              <form action={crearInquilino} className="flex flex-col gap-3">
                <input type="hidden" name="propiedadId" value={propiedad.id} />
                <input name="nombre" placeholder="Nombre completo" required className={inputClass} />
                <input name="email" type="email" placeholder="Correo" required className={inputClass} />
                <input name="telefono" placeholder="Teléfono (opcional)" className={inputClass} />
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
                <button
                  type="submit"
                  className="rounded-[10px] bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Guardar inquilino
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right: history */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between px-5 pt-5 pb-1.5">
            <span className="text-[15.5px] font-bold">Historial de pagos</span>
          </div>
          {!inquilino || inquilino.facturas.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-soft">Sin facturas todavía.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-xs font-bold tracking-wide text-ink-faint uppercase">
                  <th className="px-4.5 pb-2.5">Periodo</th>
                  <th className="px-4.5 pb-2.5">Monto</th>
                  <th className="px-4.5 pb-2.5">Método</th>
                  <th className="px-4.5 pb-2.5">Fecha de pago</th>
                  <th className="px-4.5 pb-2.5">Estado</th>
                  <th className="px-4.5 pb-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {inquilino.facturas.map((f) => (
                  <tr key={f.id} className="border-t border-border text-sm">
                    <td className="px-4.5 py-3.5">{f.periodo}</td>
                    <td className="px-4.5 py-3.5 font-semibold">₡{Number(f.monto).toLocaleString("es-CR")}</td>
                    <td className="px-4.5 py-3.5 text-ink-soft">
                      {f.metodoPago ? METODO_LABEL[f.metodoPago] : "—"}
                    </td>
                    <td className="px-4.5 py-3.5 text-ink-soft">
                      {f.pagadoEn ? f.pagadoEn.toLocaleDateString("es-CR") : "—"}
                    </td>
                    <td className="px-4.5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_TONO[f.estado]}`}>
                        {ESTADO_LABEL[f.estado]}
                      </span>
                    </td>
                    <td className="px-4.5 py-3.5 text-right">
                      {f.estado === "EN_REVISION" ? (
                        <Link href={`/dashboard/facturas/${f.id}/confirmar`} className="text-xs font-semibold text-accent">
                          Revisar →
                        </Link>
                      ) : (
                        <Link href={`/pagar/${f.id}`} className="text-xs font-semibold text-accent">
                          Ver →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
