"use client";

import { useActionState } from "react";
import type { ResultadoCorreo } from "@/lib/resultado-correo";

const VARIANTES = {
  primario: "bg-primary text-white hover:bg-primary-dark rounded-[9px] py-2.75 text-[13.5px] font-bold",
  borde:
    "border-[1.5px] border-border text-ink-soft hover:border-primary hover:text-primary rounded-[9px] py-2.75 text-[13.5px] font-bold",
} as const;

// Botón que manda un correo y le dice al usuario qué pasó: "Enviando…" mientras
// trabaja, y después "Correo enviado a …" (verde) o el motivo del fallo (rojo).
export function BotonEnviarCorreo({
  accion,
  campos,
  etiqueta,
  variante = "primario",
}: {
  accion: (anterior: ResultadoCorreo, formData: FormData) => Promise<ResultadoCorreo>;
  campos: Record<string, string>;
  etiqueta: string;
  variante?: keyof typeof VARIANTES;
}) {
  const [resultado, enviar, enviando] = useActionState(accion, null);

  return (
    <form action={enviar} className="flex flex-col gap-2.5">
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <button
        type="submit"
        disabled={enviando}
        className={`flex w-full items-center justify-center gap-2 text-center transition-colors disabled:cursor-wait disabled:opacity-70 ${VARIANTES[variante]}`}
      >
        {enviando && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        )}
        {enviando ? "Enviando…" : etiqueta}
      </button>

      {resultado && !enviando && (
        <p
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2 rounded-[9px] px-3 py-2.5 text-[12.5px] leading-snug font-semibold ${
            resultado.ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0" aria-hidden="true">
            {resultado.ok ? <path d="M5 12.5l4.5 4.5 9.5-10" /> : <path d="M6 6l12 12M18 6 6 18" />}
          </svg>
          <span>{resultado.mensaje}</span>
        </p>
      )}
    </form>
  );
}
