"use client";

import { useState } from "react";

type Pais = { nombre: string; codigo: string; bandera: string };

// Costa Rica primero (mercado principal); el resto por cercanía regional.
const PAISES: Pais[] = [
  { nombre: "Costa Rica", codigo: "+506", bandera: "🇨🇷" },
  { nombre: "Estados Unidos / Canadá", codigo: "+1", bandera: "🇺🇸" },
  { nombre: "Panamá", codigo: "+507", bandera: "🇵🇦" },
  { nombre: "Nicaragua", codigo: "+505", bandera: "🇳🇮" },
  { nombre: "Honduras", codigo: "+504", bandera: "🇭🇳" },
  { nombre: "El Salvador", codigo: "+503", bandera: "🇸🇻" },
  { nombre: "Guatemala", codigo: "+502", bandera: "🇬🇹" },
  { nombre: "México", codigo: "+52", bandera: "🇲🇽" },
  { nombre: "Colombia", codigo: "+57", bandera: "🇨🇴" },
  { nombre: "Venezuela", codigo: "+58", bandera: "🇻🇪" },
  { nombre: "Ecuador", codigo: "+593", bandera: "🇪🇨" },
  { nombre: "Perú", codigo: "+51", bandera: "🇵🇪" },
  { nombre: "Chile", codigo: "+56", bandera: "🇨🇱" },
  { nombre: "Argentina", codigo: "+54", bandera: "🇦🇷" },
  { nombre: "Uruguay", codigo: "+598", bandera: "🇺🇾" },
  { nombre: "Paraguay", codigo: "+595", bandera: "🇵🇾" },
  { nombre: "Bolivia", codigo: "+591", bandera: "🇧🇴" },
  { nombre: "Brasil", codigo: "+55", bandera: "🇧🇷" },
  { nombre: "República Dominicana", codigo: "+1", bandera: "🇩🇴" },
  { nombre: "Cuba", codigo: "+53", bandera: "🇨🇺" },
  { nombre: "España", codigo: "+34", bandera: "🇪🇸" },
  { nombre: "Francia", codigo: "+33", bandera: "🇫🇷" },
  { nombre: "Alemania", codigo: "+49", bandera: "🇩🇪" },
  { nombre: "Italia", codigo: "+39", bandera: "🇮🇹" },
  { nombre: "Reino Unido", codigo: "+44", bandera: "🇬🇧" },
];

const CLASES = {
  panel: {
    base: "rounded-[10px] border-[1.5px] border-border bg-surface text-[15px] text-ink focus-within:border-primary",
    codigo: "border-border text-ink",
    flecha: "text-ink-faint",
  },
  public: {
    base: "rounded-[3px] border border-public-border bg-public-bg text-[15px] text-public-body focus-within:border-public-primary",
    codigo: "border-public-border text-public-body",
    flecha: "text-public-muted",
  },
} as const;

// Separa un teléfono guardado ("+506 8845 2210" o "8845 2210") en código y
// número. Sin código se asume Costa Rica, que es como se guardaba antes.
function separar(valor: string): { indice: number; numero: string } {
  const limpio = valor.trim();
  if (limpio.startsWith("+")) {
    const candidatos = PAISES.map((p, i) => ({ p, i }))
      .filter(({ p }) => limpio.startsWith(p.codigo) && /^[\s\d]/.test(limpio.slice(p.codigo.length) || " "))
      .sort((a, b) => b.p.codigo.length - a.p.codigo.length);
    if (candidatos[0]) {
      return { indice: candidatos[0].i, numero: limpio.slice(candidatos[0].p.codigo.length).trim() };
    }
  }
  return { indice: 0, numero: limpio };
}

// Teléfono con selector de código de país. Envía un solo campo (`name`) con
// el formato "+506 8845 2210", o vacío si no escribieron número.
export function CampoTelefono({
  name = "telefono",
  defaultValue = "",
  placeholder = "8845 2210",
  tema = "panel",
  required = false,
}: {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  tema?: "panel" | "public";
  required?: boolean;
}) {
  const inicial = separar(defaultValue);
  const [indice, setIndice] = useState(inicial.indice);
  const [numero, setNumero] = useState(inicial.numero);
  const c = CLASES[tema];
  const pais = PAISES[indice];

  return (
    <div className={`flex items-center ${c.base}`}>
      <label className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 self-stretch border-r px-3 ${c.codigo}`}>
        <span className="text-[17px] leading-none">{pais.bandera}</span>
        <span className="text-[14.5px] font-semibold">{pais.codigo}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={c.flecha}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        <select
          aria-label="Código de país"
          value={indice}
          onChange={(e) => setIndice(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {PAISES.map((p, i) => (
            <option key={`${p.nombre}`} value={i}>
              {p.bandera} {p.nombre} ({p.codigo})
            </option>
          ))}
        </select>
      </label>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        value={numero}
        onChange={(e) => setNumero(e.target.value.replace(/[^\d\s-]/g, ""))}
        placeholder={placeholder}
        aria-label="Número de teléfono"
        className="min-w-0 flex-1 bg-transparent px-3.5 py-3 outline-none"
      />
      <input type="hidden" name={name} value={numero.trim() ? `${pais.codigo} ${numero.trim()}` : ""} />
    </div>
  );
}
