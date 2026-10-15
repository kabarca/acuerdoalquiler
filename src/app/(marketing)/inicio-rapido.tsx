"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarDraft } from "@/lib/draft-propiedad";

/** CTA del home para visitantes anónimos: arranca el registro de una
 * propiedad sin pedir cuenta todavía. El resto de los datos se completan en
 * /comenzar/propiedad, y recién al guardar ahí se pide crear cuenta o
 * iniciar sesión — ver CLAUDE.md, "Flujo de inicio rápido". */
export function InicioRapido() {
  const router = useRouter();
  const [direccion, setDireccion] = useState("");

  function continuar(e: React.FormEvent) {
    e.preventDefault();
    if (!direccion.trim()) return;
    guardarDraft({ direccion: direccion.trim() });
    router.push("/comenzar/propiedad");
  }

  return (
    <section className="border-b border-public-border bg-public-surface">
      <div className="mx-auto max-w-3xl px-8 py-20 text-center sm:px-16">
        <span className="text-[13px] font-semibold tracking-[0.12em] text-public-accent uppercase">
          Sin necesidad de crear cuenta todavía
        </span>
        <h2 className="mt-3 text-4xl font-light text-public-ink">Registre a su primer inquilino</h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-public-body">
          Escriba la propiedad para iniciar el registro. Los datos del inquilino y la cuenta se
          solicitan en el siguiente paso.
        </p>

        <form onSubmit={continuar} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 text-left sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="inicio-direccion" className="text-[13px] font-semibold text-public-body">
              Agregue la propiedad
            </label>
            <input
              id="inicio-direccion"
              name="direccion"
              type="text"
              required
              placeholder="Casa en San Pablo, Heredia"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="h-[50px] w-full rounded-[3px] border border-public-border bg-public-bg px-3.5 text-[15px] text-public-body outline-none focus:border-public-primary"
            />
          </div>
          <button
            type="submit"
            className="h-[50px] shrink-0 rounded-[3px] bg-public-primary px-7 text-[13px] font-bold tracking-[0.15em] text-white uppercase transition-colors hover:bg-public-ink"
          >
            Continuar
          </button>
        </form>
      </div>
    </section>
  );
}
