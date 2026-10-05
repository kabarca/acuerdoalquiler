"use client";

import { useState } from "react";

// Copia un enlace de la app (p. ej. el de pago de una factura) para que el
// arrendador se lo pase al inquilino por WhatsApp cuando el correo no salió.
export function BotonCopiarEnlace({ ruta, etiqueta = "Copiar enlace" }: { ruta: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const enlace = `${window.location.origin}${ruta}`;
    try {
      await navigator.clipboard.writeText(enlace);
    } catch {
      window.prompt("Copie este enlace:", enlace);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="rounded-[8px] border-[1.5px] border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary"
    >
      {copiado ? "¡Copiado!" : etiqueta}
    </button>
  );
}
