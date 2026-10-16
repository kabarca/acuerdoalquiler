"use client";

import { useEffect, useState } from "react";
import { eliminarPropiedad } from "@/app/dashboard/actions";
import { IconTrash } from "@/lib/icons";

// Botón de basurero para eliminar una propiedad. Pide confirmación antes de
// borrar, porque se llevan también al inquilino y todas sus facturas.
export function BotonEliminarPropiedad({ propiedadId, direccion }: { propiedadId: string; direccion: string }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        title="Eliminar propiedad"
        className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-danger/30 bg-danger-bg px-3.5 py-2 text-[13.5px] font-semibold text-danger transition-colors hover:border-danger hover:bg-danger hover:text-white"
      >
        <IconTrash />
        Eliminar
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAbierto(false);
          }}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="eliminar-titulo" className="w-full max-w-[420px] rounded-2xl bg-surface p-6 shadow-[0_24px_60px_-16px_rgba(16,24,38,0.4)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
              <IconTrash />
            </div>
            <h2 id="eliminar-titulo" className="mt-4 text-[18px] font-semibold">
              ¿Eliminar esta propiedad?
            </h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
              <strong className="text-ink">{direccion}</strong> se borrará junto con su inquilino y todo su
              historial de facturas. No se puede deshacer.
            </p>
            <form action={eliminarPropiedad} className="mt-5 flex gap-3">
              <input type="hidden" name="propiedadId" value={propiedadId} />
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="flex-1 rounded-[10px] border-[1.5px] border-border py-2.5 text-[14px] font-semibold text-ink-soft hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-danger py-2.5 text-[14px] font-bold text-white hover:opacity-90"
              >
                <IconTrash />
                Sí, eliminar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
