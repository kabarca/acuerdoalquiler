"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  "/dashboard/propiedades",
  "/dashboard/inquilinos",
  "/dashboard/pagos",
  "/dashboard/configuracion",
  "/dashboard/ayuda",
];

// Flecha para volver al Panel desde las secciones del menú lateral. Las
// páginas más profundas (detalle de propiedad, disputas, etc.) ya traen su
// propia ruta de migas, así que no se repite ahí.
export function VolverAlPanel() {
  const pathname = usePathname();

  if (!SECCIONES.includes(pathname)) {
    return null;
  }

  return (
    <div className="-mb-3 px-11 pt-7">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-faint hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        Volver al panel
      </Link>
    </div>
  );
}
