"use client";

import { useState } from "react";
import { UBICACIONES_COSTA_RICA } from "@/lib/ubicaciones-costa-rica";

const ESTILOS = {
  panel: {
    label: "text-[13px] font-semibold text-ink-soft",
    select:
      "w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
  },
  public: {
    label: "text-[13px] font-semibold text-public-body",
    select:
      "w-full rounded-[3px] border border-public-border bg-public-bg px-3.5 py-3 text-[15px] text-public-body outline-none focus:border-public-primary disabled:cursor-not-allowed disabled:opacity-50",
  },
};

/** Cascada Provincia → Cantón → Distrito con el catálogo oficial del IGN
 * (ver lib/ubicaciones-costa-rica.ts). Se usa tanto en /comenzar/propiedad
 * (tema público) como en /dashboard/propiedades/nueva (tema del panel). */
export function UbicacionSelects({
  defaultProvincia = "",
  defaultCanton = "",
  defaultDistrito = "",
  tema = "panel",
}: {
  defaultProvincia?: string;
  defaultCanton?: string;
  defaultDistrito?: string;
  tema?: "panel" | "public";
}) {
  const [provincia, setProvincia] = useState(defaultProvincia);
  const [canton, setCanton] = useState(defaultCanton);
  const [distrito, setDistrito] = useState(defaultDistrito);

  const estilo = ESTILOS[tema];
  const cantones = UBICACIONES_COSTA_RICA.find((p) => p.provincia === provincia)?.cantones ?? [];
  const distritos = cantones.find((c) => c.canton === canton)?.distritos ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <label className={estilo.label}>Provincia</label>
        <select
          name="provincia"
          required
          className={estilo.select}
          value={provincia}
          onChange={(e) => {
            setProvincia(e.target.value);
            setCanton("");
            setDistrito("");
          }}
        >
          <option value="">Seleccionar…</option>
          {UBICACIONES_COSTA_RICA.map((p) => (
            <option key={p.provincia} value={p.provincia}>
              {p.provincia}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={estilo.label}>Cantón</label>
        <select
          name="canton"
          required
          disabled={!provincia}
          className={estilo.select}
          value={canton}
          onChange={(e) => {
            setCanton(e.target.value);
            setDistrito("");
          }}
        >
          <option value="">{provincia ? "Seleccionar…" : "Elija primero una provincia"}</option>
          {cantones.map((c) => (
            <option key={c.canton} value={c.canton}>
              {c.canton}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={estilo.label}>Distrito</label>
        <select
          name="distrito"
          required
          disabled={!canton}
          className={estilo.select}
          value={distrito}
          onChange={(e) => setDistrito(e.target.value)}
        >
          <option value="">{canton ? "Seleccionar…" : "Elija primero un cantón"}</option>
          {distritos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
