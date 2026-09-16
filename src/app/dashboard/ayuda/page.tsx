import { getArrendadorActual } from "@/lib/auth";
import { linkWhatsAppSoporte } from "@/lib/config";

export default async function AyudaPage() {
  const arrendador = await getArrendadorActual();

  const mensaje = `Hola, soy ${arrendador.nombre} (${arrendador.email}) y tengo un inconveniente con Rentia:`;

  return (
    <div className="px-8 py-9">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-semibold">Ayuda</h1>
        <p className="text-[15px] text-ink-soft">
          ¿Tiene algún inconveniente con la plataforma? Escríbanos por WhatsApp.
        </p>
      </div>

      <div className="mt-7 flex max-w-lg flex-col items-start gap-5 rounded-2xl border border-border bg-surface p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-success-bg text-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.2A8.5 8.5 0 1 0 12 3.5Z" />
            <path d="M8.5 9.5c0 3.5 2.5 6 6 6l.9-1.8c.2-.4-.1-.8-.5-.9l-2-.5c-.3-.1-.6 0-.8.3l-.3.5c-1-.6-1.8-1.4-2.4-2.4l.5-.3c.2-.2.4-.5.3-.8l-.5-2c-.1-.4-.5-.7-.9-.5Z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold">Soporte de Rentia</h2>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Cuéntenos qué está pasando y le respondemos directamente por WhatsApp — problemas con
            una factura, un pago, o cualquier duda sobre su cuenta.
          </p>
        </div>
        <a
          href={linkWhatsAppSoporte(mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-[10px] bg-success px-5 py-3 text-[14.5px] font-semibold text-white hover:opacity-90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.2A8.5 8.5 0 1 0 12 3.5Z" />
          </svg>
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  );
}
