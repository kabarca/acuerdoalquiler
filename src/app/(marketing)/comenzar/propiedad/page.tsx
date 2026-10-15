"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { guardarDraft, useDraftPropiedad, type DraftPropiedad } from "@/lib/draft-propiedad";
import { UbicacionSelects } from "@/components/ubicacion-selects";

const DIAS = Array.from({ length: 28 }, (_, i) => i + 1);
// A dónde vuelve el visitante después de crear cuenta o iniciar sesión —
// /dashboard/propiedades/nueva lee este mismo draft y lo pre-llena (ver
// nueva-propiedad-form.tsx), dejando la sección de inquilino vacía.
const SIGUIENTE_PASO = "/dashboard/propiedades/nueva?draft=1";

const inputClass =
  "w-full rounded-[3px] border border-public-border bg-public-bg px-3.5 py-3 text-[15px] text-public-body outline-none focus:border-public-primary";
const labelClass = "text-[13px] font-semibold text-public-body";

function Step({ n, label, activo }: { n: number; label: string; activo: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-[3px] text-[13px] font-bold ${
          activo ? "bg-public-primary text-white" : "bg-public-surface text-public-muted"
        }`}
      >
        {n}
      </div>
      <span className={`text-sm font-semibold ${activo ? "text-public-ink" : "text-public-muted"}`}>{label}</span>
    </div>
  );
}

export default function ComenzarPropiedadPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const draft = useDraftPropiedad();

  function recolectarDraft(form: HTMLFormElement): DraftPropiedad {
    const fd = new FormData(form);
    const nuevo: DraftPropiedad = {
      direccion: String(fd.get("direccion") ?? ""),
      tipo: fd.get("tipo") as DraftPropiedad["tipo"],
      provincia: String(fd.get("provincia") ?? ""),
      canton: String(fd.get("canton") ?? ""),
      distrito: String(fd.get("distrito") ?? ""),
      montoRenta: String(fd.get("montoRenta") ?? ""),
      diaCobro: String(fd.get("diaCobro") ?? ""),
    };
    guardarDraft(nuevo);
    return nuevo;
  }

  function alGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    recolectarDraft(e.currentTarget);
    router.push(`/registro?next=${encodeURIComponent(SIGUIENTE_PASO)}`);
  }

  function irALogin() {
    if (!formRef.current || !formRef.current.reportValidity()) return;
    recolectarDraft(formRef.current);
    router.push(`/login?next=${encodeURIComponent(SIGUIENTE_PASO)}`);
  }

  return (
    <div className="min-h-screen bg-public-bg">
      <header className="border-b border-public-border px-8 py-5 sm:px-16">
        <Link href="/" className="flex w-fit items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-public-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
          </div>
          <span className="text-lg font-semibold text-public-ink">Acuerdo Alquiler</span>
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-8 py-14 sm:px-16">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[32px] font-light text-public-ink">Registre su propiedad</h1>
          <p className="text-[15px] text-public-muted">
            Crearemos su cuenta en el siguiente paso, antes de agregar al inquilino.
          </p>
        </div>

        <div className="my-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Step n={1} label="Propiedad" activo />
          <div className="h-[1.5px] w-10 bg-public-border" />
          <Step n={2} label="Cuenta" activo={false} />
          <div className="h-[1.5px] w-10 bg-public-border" />
          <Step n={3} label="Inquilino" activo={false} />
        </div>

        <form ref={formRef} onSubmit={alGuardar} className="flex flex-col gap-8">
          <section className="flex flex-col gap-5 border border-public-border p-7">
            <h2 className="text-lg font-semibold text-public-ink">Datos de la propiedad</h2>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Agregue la propiedad</label>
              <input
                name="direccion"
                required
                defaultValue={draft?.direccion ?? ""}
                placeholder="Casa en San Pablo, Heredia"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Tipo de propiedad</label>
              <select name="tipo" defaultValue={draft?.tipo ?? "APARTAMENTO"} className={inputClass}>
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
                <option value="LOCAL_COMERCIAL">Local comercial</option>
              </select>
            </div>
            <UbicacionSelects
              key={draft ? "con-draft" : "sin-draft"}
              tema="public"
              defaultProvincia={draft?.provincia ?? ""}
              defaultCanton={draft?.canton ?? ""}
              defaultDistrito={draft?.distrito ?? ""}
            />
          </section>

          <section className="flex flex-col gap-5 border border-public-border p-7">
            <h2 className="text-lg font-semibold text-public-ink">Condiciones de pago</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Monto mensual del arriendo</label>
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
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Día de vencimiento mensual</label>
                <select name="diaCobro" defaultValue={draft?.diaCobro ?? "5"} className={inputClass}>
                  {DIAS.map((d) => (
                    <option key={d} value={d}>
                      Día {d} de cada mes
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[12.5px] leading-snug text-public-muted">
              La factura se genera y se envía el día 1 de cada mes por defecto — puede ajustar esas
              fechas después, desde su panel.
            </p>
          </section>

          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              className="w-full max-w-xs rounded-[3px] bg-public-primary px-7 py-3.5 text-[13px] font-bold tracking-[0.15em] text-white uppercase transition-colors hover:bg-public-ink sm:w-auto"
            >
              Guardar y crear cuenta
            </button>
            <p className="text-sm text-public-muted">
              ¿Ya tiene cuenta?{" "}
              <button type="button" onClick={irALogin} className="font-semibold text-public-primary underline-offset-2 hover:underline">
                Inicie sesión
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
