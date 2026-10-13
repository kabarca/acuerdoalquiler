import { getArrendadorActual } from "@/lib/auth";
import { DatosBancariosForm } from "./datos-bancarios-form";

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
        <p className="mt-1 text-[14.5px] text-ink-soft">Su cuenta y las integraciones de Acuerdo Alquiler.</p>
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
        <DatosBancariosForm arrendador={arrendador} />
      </div>

      {arrendador.esAdmin && (
        <div className="max-w-xl rounded-2xl border border-border bg-surface p-6.5">
          <h2 className="text-[15.5px] font-bold">Integraciones</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Necesarias para cobrar y enviar correos de verdad. Solo la ven los administradores.
          </p>
          <div className="mt-3">
            <EstadoConexion conectado={Boolean(process.env.ONVOPAY_SECRET_KEY)} nombre="Onvopay (cobro con tarjeta)" />
            <EstadoConexion conectado={Boolean(process.env.RESEND_API_KEY)} nombre="Resend (envío de correos)" />
          </div>
        </div>
      )}
    </div>
  );
}
