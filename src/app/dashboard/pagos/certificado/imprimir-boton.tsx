"use client";

export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-[10px] bg-primary px-5 py-2.75 text-[13.5px] font-semibold text-white print:hidden"
    >
      Imprimir / Guardar como PDF
    </button>
  );
}
