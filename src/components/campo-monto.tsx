"use client";

import { useEffect, useRef, useState } from "react";
import { MONEDAS, formatearMonto, simboloDe, type Moneda } from "@/lib/moneda";

const MAXIMO = 99_999_999.99; // Decimal(10, 2) en la base de datos

const TEMAS = {
  panel: {
    campo:
      "rounded-[10px] border-[1.5px] border-border bg-surface text-[15px] text-ink focus-within:border-primary",
    simbolo: "text-ink-soft",
    activo: "bg-primary text-white",
    inactivo: "text-ink-soft hover:bg-primary-light",
    grupo: "rounded-[10px] border-[1.5px] border-border bg-surface",
    ayuda: "text-ink-faint",
    error: "text-danger",
  },
  public: {
    campo:
      "rounded-[3px] border border-public-border bg-public-bg text-[15px] text-public-body focus-within:border-public-primary",
    simbolo: "text-public-muted",
    activo: "bg-public-primary text-white",
    inactivo: "text-public-muted hover:bg-public-surface",
    grupo: "rounded-[3px] border border-public-border bg-public-bg",
    ayuda: "text-public-muted",
    error: "text-red-700",
  },
} as const;

// Lo que el usuario escribe se muestra tal cual. Aquí solo se interpreta para
// mostrar la vista previa y para enviar un número limpio al servidor:
//   "550000", "550.000" y "550,000" → 550000   (un separador seguido de
//   "1250.50" y "1250,5"            → 1250.5     exactamente 3 dígitos son miles)
//   "1.234.567,89"                  → 1234567.89
export function interpretarMonto(texto: string): number | null {
  const t = texto.replace(/\s/g, "");
  if (!t) return null;
  if (!/^\d[\d.,]*$/.test(t)) return null;

  const ultimo = Math.max(t.lastIndexOf("."), t.lastIndexOf(","));
  if (ultimo === -1) return Number(t);

  const decimales = t.slice(ultimo + 1);
  const entero = t.slice(0, ultimo).replace(/[.,]/g, "");
  if (decimales.length === 0) return Number(entero);
  if (decimales.length === 3) return Number(entero + decimales); // separador de miles
  if (decimales.length <= 2) return Number(`${entero}.${decimales}`);
  return null;
}

// Monto + moneda del alquiler. Envía dos campos al formulario: `montoRenta`
// (número limpio) y `moneda` ("CRC" | "USD").
export function CampoMonto({
  defaultMonto = "",
  defaultMoneda = "CRC",
  nameMonto = "montoRenta",
  nameMoneda = "moneda",
  tema = "panel",
  etiqueta,
}: {
  defaultMonto?: string;
  defaultMoneda?: Moneda;
  nameMonto?: string;
  nameMoneda?: string;
  tema?: "panel" | "public";
  etiqueta?: string;
}) {
  const t = TEMAS[tema];
  const [moneda, setMoneda] = useState<Moneda>(defaultMoneda);
  const [texto, setTexto] = useState(defaultMonto);
  const visible = useRef<HTMLInputElement>(null);

  const valor = interpretarMonto(texto);
  const fueraDeRango = valor !== null && (valor <= 0 || valor > MAXIMO);
  const invalido = texto.trim() !== "" && (valor === null || fueraDeRango);
  const valido = valor !== null && !fueraDeRango;

  useEffect(() => {
    visible.current?.setCustomValidity(
      invalido ? "Escriba un monto válido, por ejemplo 550000 o 1250,50." : "",
    );
  }, [invalido]);

  return (
    <div className="flex flex-col gap-2">
      {etiqueta && (
        <label className={`text-[13px] font-semibold ${tema === "panel" ? "text-ink-soft" : "text-public-body"}`}>
          {etiqueta}
        </label>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div role="radiogroup" aria-label="Moneda" className={`flex shrink-0 gap-1 p-1 ${t.grupo}`}>
          {MONEDAS.map((m) => (
            <button
              key={m.valor}
              type="button"
              role="radio"
              aria-checked={moneda === m.valor}
              onClick={() => setMoneda(m.valor)}
              className={`flex-1 rounded-[7px] px-3.5 py-2 text-[13.5px] font-semibold transition-colors sm:flex-none ${
                moneda === m.valor ? t.activo : t.inactivo
              }`}
            >
              {m.nombre} <span className="opacity-75">({m.simbolo})</span>
            </button>
          ))}
        </div>

        <div className={`flex flex-1 items-center gap-2 px-3.5 ${t.campo}`}>
          <span className={`text-[15px] font-semibold ${t.simbolo}`}>{simboloDe(moneda)}</span>
          <input
            ref={visible}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            required
            value={texto}
            onChange={(e) => setTexto(e.target.value.replace(/[^\d.,\s]/g, ""))}
            placeholder={moneda === "USD" ? "1200.00" : "550000"}
            aria-label="Monto mensual"
            className="min-w-0 flex-1 bg-transparent py-3 outline-none"
          />
          <span className={`text-xs font-bold tracking-wide ${t.simbolo}`}>{moneda}</span>
        </div>
      </div>

      <input type="hidden" name={nameMoneda} value={moneda} />
      <input type="hidden" name={nameMonto} value={valido ? String(valor) : ""} />

      <p className={`min-h-[18px] text-[12.5px] ${invalido ? t.error : t.ayuda}`}>
        {invalido
          ? "Escriba un monto válido, por ejemplo 550000 o 1250,50."
          : valido
            ? `Se cobrarán ${formatearMonto(valor, moneda)} ${moneda} cada mes.`
            : "Escriba el monto mensual y elija la moneda."}
      </p>
    </div>
  );
}
