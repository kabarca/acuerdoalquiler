"use client";

import { useState } from "react";
import { actualizarDatosBancarios } from "../actions";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary";

type Arrendador = {
  nombre: string;
  tipoCuentaBancaria: "NACIONAL" | "INTERNACIONAL";
  banco: string | null;
  cuentaIban: string | null;
  titularCuenta: string | null;
  swiftBic: string | null;
  paisBanco: string | null;
  direccionBanco: string | null;
  direccionTitular: string | null;
  numeroRuta: string | null;
};

export function DatosBancariosForm({ arrendador }: { arrendador: Arrendador }) {
  const [tipo, setTipo] = useState<"NACIONAL" | "INTERNACIONAL">(arrendador.tipoCuentaBancaria);
  const internacional = tipo === "INTERNACIONAL";

  return (
    <form action={actualizarDatosBancarios} className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-ink-soft">Tipo de cuenta</label>
        <div className="flex gap-2.5">
          <label
            className={`flex-1 cursor-pointer rounded-[10px] border-[1.5px] p-3 text-center text-[13.5px] font-semibold ${
              !internacional ? "border-primary bg-primary-light text-primary" : "border-border text-ink-soft"
            }`}
          >
            <input
              type="radio"
              name="tipoCuentaBancaria"
              value="NACIONAL"
              checked={!internacional}
              onChange={() => setTipo("NACIONAL")}
              className="sr-only"
            />
            Cuenta en Costa Rica
          </label>
          <label
            className={`flex-1 cursor-pointer rounded-[10px] border-[1.5px] p-3 text-center text-[13.5px] font-semibold ${
              internacional ? "border-primary bg-primary-light text-primary" : "border-border text-ink-soft"
            }`}
          >
            <input
              type="radio"
              name="tipoCuentaBancaria"
              value="INTERNACIONAL"
              checked={internacional}
              onChange={() => setTipo("INTERNACIONAL")}
              className="sr-only"
            />
            Cuenta internacional
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-ink-soft">Banco</label>
        <input
          name="banco"
          defaultValue={arrendador.banco ?? ""}
          placeholder={internacional ? "Ej. Bank of America" : "Ej. Banco Nacional de Costa Rica"}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-ink-soft">
          {internacional ? "Número de cuenta o IBAN" : "Cuenta IBAN"}
        </label>
        <input
          name="cuentaIban"
          defaultValue={arrendador.cuentaIban ?? ""}
          placeholder={internacional ? "Ej. 000123456789" : "CR05 0151 0001 0123 4567 89"}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-ink-soft">Titular de la cuenta</label>
        <input
          name="titularCuenta"
          defaultValue={arrendador.titularCuenta ?? ""}
          placeholder={arrendador.nombre}
          className={inputClass}
        />
      </div>

      {internacional && (
        <>
          <div className="my-1 border-t border-border" />
          <p className="text-[12.5px] text-ink-faint">
            Datos adicionales que pide una transferencia internacional (wire transfer).
          </p>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink-soft">Código SWIFT/BIC</label>
              <input
                name="swiftBic"
                defaultValue={arrendador.swiftBic ?? ""}
                placeholder="Ej. BOFAUS3N"
                className={inputClass}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink-soft">País del banco</label>
              <input
                name="paisBanco"
                defaultValue={arrendador.paisBanco ?? ""}
                placeholder="Ej. Estados Unidos"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Dirección del banco</label>
            <input
              name="direccionBanco"
              defaultValue={arrendador.direccionBanco ?? ""}
              placeholder="Dirección completa de la sucursal"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Dirección del titular</label>
            <input
              name="direccionTitular"
              defaultValue={arrendador.direccionTitular ?? ""}
              placeholder="Su dirección registrada ante el banco"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">
              Número de ruta (ABA) <span className="font-normal text-ink-faint">— solo bancos en EE. UU.</span>
            </label>
            <input
              name="numeroRuta"
              defaultValue={arrendador.numeroRuta ?? ""}
              placeholder="Ej. 026009593"
              className={inputClass}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="self-start rounded-[10px] bg-primary px-5 py-2.75 text-[13.5px] font-semibold text-white hover:bg-primary-dark"
      >
        Guardar datos bancarios
      </button>
    </form>
  );
}
