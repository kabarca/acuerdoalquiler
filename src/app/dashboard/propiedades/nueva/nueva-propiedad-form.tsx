"use client";

import Link from "next/link";
import { crearPropiedadConInquilino } from "../../actions";
import { IconBuilding, IconUsers, IconCard } from "@/lib/icons";
import { CamposFacturacion } from "@/components/campos-facturacion";
import { UbicacionSelects } from "@/components/ubicacion-selects";
import { useDraftPropiedad, limpiarDraft } from "@/lib/draft-propiedad";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary";

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary-light text-primary">
        {icon}
      </div>
      <h3 className="text-[17px] font-semibold">{children}</h3>
    </div>
  );
}

function Step({ n, label, activo }: { n: number; label: string; activo: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ${
          activo ? "bg-primary text-white" : "bg-primary-light text-primary"
        }`}
      >
        {n}
      </div>
      <span className={`text-sm font-semibold ${activo ? "" : "text-ink-soft"}`}>{label}</span>
    </div>
  );
}

/** Si el arrendador viene del flujo público de inicio rápido
 * (/comenzar/propiedad → crear cuenta), este formulario pre-llena la
 * sección de propiedad con lo que ya había escrito como visitante anónimo,
 * y deja la de inquilino vacía para completarla ahora. Si no hay draft
 * (alguien agregando una propiedad normal desde el panel), simplemente se
 * ve igual que siempre. Ver CLAUDE.md, "Flujo de inicio rápido". */
export function NuevaPropiedadForm() {
  const draft = useDraftPropiedad();

  return (
    <form
      action={crearPropiedadConInquilino}
      onSubmit={() => limpiarDraft()}
      className="flex flex-col gap-6"
    >
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7">
        <SectionTitle icon={<IconBuilding />}>Datos de la propiedad</SectionTitle>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">Dirección completa</label>
          <input
            name="direccion"
            required
            defaultValue={draft?.direccion ?? ""}
            placeholder="Ej. Torres del Mar, Apto 8B, Santa Ana"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">Tipo de propiedad</label>
          <select name="tipo" className={inputClass} defaultValue={draft?.tipo ?? "APARTAMENTO"}>
            <option value="APARTAMENTO">Apartamento</option>
            <option value="CASA">Casa</option>
            <option value="LOCAL_COMERCIAL">Local comercial</option>
          </select>
        </div>
        <UbicacionSelects
          key={draft ? "con-draft" : "sin-draft"}
          tema="panel"
          defaultProvincia={draft?.provincia ?? ""}
          defaultCanton={draft?.canton ?? ""}
          defaultDistrito={draft?.distrito ?? ""}
        />
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7">
        <SectionTitle icon={<IconUsers />}>Datos del inquilino</SectionTitle>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Nombre completo</label>
            <input name="nombre" required placeholder="Ej. Andrés Ruiz" className={inputClass} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Teléfono</label>
            <input name="telefono" placeholder="Ej. 8845 2210" className={inputClass} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">Correo electrónico</label>
          <input name="email" type="email" required placeholder="inquilino@ejemplo.com" className={inputClass} />
          <p className="text-[12.5px] text-ink-faint">
            A esta dirección se enviarán la factura y el enlace de pago.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7">
        <SectionTitle icon={<IconCard />}>Detalles del pago</SectionTitle>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">
              Monto mensual del arriendo
            </label>
            <input
              name="montoRenta"
              type="number"
              step="0.01"
              required
              defaultValue={draft?.montoRenta ?? ""}
              placeholder="₡ 550.000"
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-bold">Facturación automática</p>
          <p className="text-[12.5px] text-ink-faint">
            Acuerdo Alquiler genera y envía la factura al correo del inquilino sola, en las fechas que usted elija.
          </p>
        </div>
        <CamposFacturacion diaCobro={draft?.diaCobro ? Number(draft.diaCobro) : undefined} />
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">
              Inicio de contrato (opcional)
            </label>
            <input name="fechaInicioContrato" type="date" className={inputClass} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">
              Fin de contrato (opcional)
            </label>
            <input name="fechaFinContrato" type="date" className={inputClass} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3.5">
        <Link
          href="/dashboard/propiedades"
          className="rounded-[10px] border-[1.5px] border-border px-6 py-3.5 text-[15px] font-semibold text-ink-soft"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-[10px] bg-primary px-6.5 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-dark"
        >
          Registrar inquilino y activar cobro
        </button>
      </div>
    </form>
  );
}

export { Step };
