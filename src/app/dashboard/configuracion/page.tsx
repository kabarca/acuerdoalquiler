import { getArrendadorActual } from "@/lib/auth";
import { actualizarDatosBancarios } from "../actions";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary";

function EstadoConexion({ conectado, nombre }: { conectado: boolean; nombre: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border py-3.5 first:border-t-0">
      <span className="text-[14.5px] font-semibold">{nombre}</span>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
          conectado ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
        }`}
      >
        {conectado ? "Conectado" : "Pendiente de configurar"}
      </span>
    </div>
  );
}

export default async function ConfiguracionPage() {
  const arrendador = await getArrendadorActual();

  return (
    <div className="flex flex-col gap-7 px-11 py-9">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="mt-1 text-[14.5px] text-ink-soft">Su cuenta y las integraciones de Rentia.</p>
      </div>

      <div className="max-w-xl rounded-2xl border border-border bg-surface p-6.5">
        <h2 className="text-[15.5px] font-bold">Su cuenta</h2>
        <div className="mt-4 flex flex-col gap-3 text-[14.5px]">
          <div className="flex justify-between">
            <span className="text-ink-faint">Nombre</span>
            <span className="font-semibold">{arrendador.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Correo</span>
            <span className="font-semibold">{arrendador.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl rounded-2xl border border-border bg-surface p-6.5">
        <h2 className="text-[15.5px] font-bold">Cuenta bancaria para transferencias</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Se le muestra a su inquilino cuando elige pagar por transferencia bancaria.
        </p>
        <form action={actualizarDatosBancarios} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Banco</label>
            <input
              name="banco"
              defaultValue={arrendador.banco ?? ""}
              placeholder="Ej. Banco Nacional de Costa Rica"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Cuenta IBAN</label>
            <input
              name="cuentaIban"
              defaultValue={arrendador.cuentaIban ?? ""}
              placeholder="CR05 0151 0001 0123 4567 89"
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
          <button
            type="submit"
            className="self-start rounded-[10px] bg-primary px-5 py-2.75 text-[13.5px] font-semibold text-white hover:bg-primary-dark"
          >
            Guardar datos bancarios
          </button>
        </form>
      </div>

      <div className="max-w-xl rounded-2xl border border-border bg-surface p-6.5">
        <h2 className="text-[15.5px] font-bold">Integraciones</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Necesarias para cobrar y enviar correos de verdad.
        </p>
        <div className="mt-3">
          <EstadoConexion conectado={Boolean(process.env.ONVOPAY_SECRET_KEY)} nombre="Onvopay (cobro con tarjeta)" />
          <EstadoConexion conectado={Boolean(process.env.RESEND_API_KEY)} nombre="Resend (envío de correos)" />
        </div>
      </div>
    </div>
  );
}
