"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
// La semana empieza en lunes, como en Costa Rica.
const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

type Fecha = { a: number; m: number; d: number }; // m: 0-11

function aTexto({ a, m, d }: Fecha) {
  return `${a}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function desdeTexto(texto: string | undefined): Fecha | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto ?? "");
  if (!r) return null;
  return { a: Number(r[1]), m: Number(r[2]) - 1, d: Number(r[3]) };
}

function hoy(): Fecha {
  const n = new Date();
  return { a: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
}

function comparar(x: Fecha, y: Fecha) {
  return aTexto(x).localeCompare(aTexto(y));
}

function bonita({ a, m, d }: Fecha) {
  return `${d} de ${MESES[m]} de ${a}`;
}

// Selector de fecha propio, en lugar del <input type="date"> del navegador
// (que se ve distinto en cada navegador y es muy anticuado). Envía la fecha
// como "AAAA-MM-DD" en un campo oculto llamado `name`, igual que el input
// nativo, así que las acciones del servidor no cambian.
export function SelectorFecha({
  name,
  defaultValue,
  min,
  required = false,
  placeholder = "Seleccionar fecha",
}: {
  name: string;
  defaultValue?: string;
  min?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState<Fecha | null>(desdeTexto(defaultValue));
  const minimo = desdeTexto(min);
  const [vista, setVista] = useState<{ a: number; m: number }>(() => {
    const base = desdeTexto(defaultValue) ?? hoy();
    return { a: base.a, m: base.m };
  });

  useEffect(() => {
    if (!abierto) return;
    function fuera(e: MouseEvent) {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierto(false);
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const celdas = useMemo(() => {
    const primero = new Date(vista.a, vista.m, 1);
    const huecos = (primero.getDay() + 6) % 7; // lunes = 0
    const total = new Date(vista.a, vista.m + 1, 0).getDate();
    return [...Array(huecos).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)] as (number | null)[];
  }, [vista]);

  const anios = useMemo(() => {
    const actual = new Date().getFullYear();
    const desde = Math.min(actual - 5, vista.a);
    const hasta = Math.max(actual + 20, vista.a);
    return Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
  }, [vista.a]);

  function mover(delta: number) {
    const f = new Date(vista.a, vista.m + delta, 1);
    setVista({ a: f.getFullYear(), m: f.getMonth() });
  }

  function elegir(d: number) {
    setValor({ a: vista.a, m: vista.m, d });
    setAbierto(false);
  }

  const hoyFecha = hoy();
  const deshabilitado = (d: number) => !!minimo && comparar({ a: vista.a, m: vista.m, d }, minimo) < 0;

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className={`flex w-full items-center gap-2.5 rounded-[10px] border-[1.5px] bg-surface px-3.5 py-3 text-left text-[15px] outline-none transition-colors hover:border-primary focus-visible:border-primary ${
          abierto ? "border-primary" : "border-border"
        }`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-faint" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <span className={`flex-1 truncate ${valor ? "text-ink" : "text-ink-faint"}`}>
          {valor ? bonita(valor) : placeholder}
        </span>
        {valor && !required && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Borrar fecha"
            onClick={(e) => {
              e.stopPropagation();
              setValor(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setValor(null);
              }
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full text-ink-faint hover:bg-bg hover:text-ink"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </span>
        )}
      </button>

      <input type="hidden" name={name} value={valor ? aTexto(valor) : ""} />
      {/* Para que "required" funcione sin depender del campo oculto. */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={valor ? aTexto(valor) : ""}
          onChange={() => {}}
          onFocus={() => setAbierto(true)}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0 opacity-0"
        />
      )}

      {abierto && (
        <div
          role="dialog"
          aria-label="Calendario"
          className="absolute left-0 z-50 mt-2 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-3.5 shadow-[0_18px_40px_-12px_rgba(16,24,38,0.28)]"
        >
          <div className="mb-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => mover(-1)}
              aria-label="Mes anterior"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-primary-light hover:text-primary"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <select
              aria-label="Mes"
              value={vista.m}
              onChange={(e) => setVista((v) => ({ ...v, m: Number(e.target.value) }))}
              className="min-w-0 flex-1 cursor-pointer rounded-lg bg-transparent px-1.5 py-1.5 text-center text-[14px] font-semibold capitalize outline-none hover:bg-bg"
            >
              {MESES.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              aria-label="Año"
              value={vista.a}
              onChange={(e) => setVista((v) => ({ ...v, a: Number(e.target.value) }))}
              className="w-[74px] shrink-0 cursor-pointer rounded-lg bg-transparent px-1.5 py-1.5 text-center text-[14px] font-semibold outline-none hover:bg-bg"
            >
              {anios.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => mover(1)}
              aria-label="Mes siguiente"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-primary-light hover:text-primary"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {DIAS_SEMANA.map((d, i) => (
              <span key={i} className="pb-1.5 text-[11.5px] font-bold text-ink-faint">{d}</span>
            ))}
            {celdas.map((d, i) => {
              if (d === null) return <span key={`v${i}`} />;
              const actual: Fecha = { a: vista.a, m: vista.m, d };
              const elegido = !!valor && comparar(actual, valor) === 0;
              const esHoy = comparar(actual, hoyFecha) === 0;
              const bloqueado = deshabilitado(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={bloqueado}
                  onClick={() => elegir(d)}
                  aria-label={bonita(actual)}
                  aria-pressed={elegido}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13.5px] transition-colors ${
                    elegido
                      ? "bg-primary font-bold text-white"
                      : bloqueado
                        ? "cursor-not-allowed text-ink-faint/50"
                        : esHoy
                          ? "font-bold text-primary ring-1 ring-primary hover:bg-primary-light"
                          : "text-ink hover:bg-primary-light"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[13px] font-semibold">
            <button
              type="button"
              onClick={() => {
                setVista({ a: hoyFecha.a, m: hoyFecha.m });
                if (!minimo || comparar(hoyFecha, minimo) >= 0) {
                  setValor(hoyFecha);
                  setAbierto(false);
                }
              }}
              className="rounded-lg px-2 py-1 text-accent hover:bg-primary-light"
            >
              Hoy
            </button>
            {!required && (
              <button
                type="button"
                onClick={() => {
                  setValor(null);
                  setAbierto(false);
                }}
                className="rounded-lg px-2 py-1 text-ink-soft hover:bg-bg"
              >
                Borrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
