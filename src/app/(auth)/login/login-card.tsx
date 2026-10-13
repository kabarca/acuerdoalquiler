"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "./actions";

/** Pantalla de transición al entrar — logo de Acuerdo Alquiler + barra de progreso. */
function TransicionEntrada() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-bg animate-[rt-fade-in_200ms_ease-out] motion-reduce:animate-none">
      <div className="flex flex-col items-center gap-7">
        <div className="flex items-center gap-2.5 animate-[rt-logo-in_600ms_cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:animate-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="12" height="18" rx="1" />
              <path d="M16 21v-6h4v6" />
            </svg>
          </div>
          <span className="font-heading text-2xl font-bold text-ink">Acuerdo Alquiler</span>
        </div>
        <div className="h-[3px] w-36 overflow-hidden rounded-full bg-border">
          <div className="h-full w-full origin-left rounded-full bg-primary animate-[rt-progress_700ms_cubic-bezier(0.35,0,0.1,1)_120ms_forwards] motion-reduce:animate-none" />
        </div>
        <p className="animate-[rt-fade-in_500ms_ease-out_200ms_both] text-[11px] font-semibold tracking-[0.18em] text-ink-faint uppercase motion-reduce:animate-none">
          Entrando a su panel
        </p>
      </div>
    </div>
  );
}

export function LoginCard({ error }: { error?: string }) {
  const [entrando, setEntrando] = useState(false);

  return (
    <>
      {entrando && <TransicionEntrada />}
      <div
        className={`w-full max-w-[420px] transition-all duration-300 motion-reduce:transition-none ${
          entrando ? "scale-[0.98] opacity-0 blur-[2px]" : ""
        }`}
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-semibold">Iniciar sesión</h1>
          <p className="text-[15px] text-ink-soft">Entre a su panel de arrendador.</p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <form action={login} onSubmit={() => setEntrando(true)} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Correo electrónico</label>
            <input
              name="email"
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
              className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[15px] outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={entrando}
            className="mt-2 w-full rounded-[10px] bg-primary py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
          >
            {entrando ? "Ingresando…" : "Entrar"}
          </button>

          <p className="text-center text-sm text-ink-soft">
            ¿Todavía no tiene cuenta?{" "}
            <Link href="/registro" className="font-semibold text-accent">
              Regístrese
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
