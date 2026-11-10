import { marcarFacturaEnviadaManual } from "@/app/dashboard/actions";
import { BotonCopiarEnlace } from "@/components/boton-copiar-enlace";

// Aviso al arrendador de que una factura todavía no se le ha enviado al
// inquilino, con lo necesario para resolverlo a mano ya mismo: copiar el
// enlace de pago (para mandarlo por WhatsApp) y marcarla como enviada.
export function AvisoFacturaNoEnviada({
  facturaId,
  inquilino,
  direccion,
  motivo,
}: {
  facturaId: string;
  inquilino: string;
  direccion: string;
  motivo: string | null;
}) {
  return (
    // El diseño depende del ancho de la caja donde está (container query), no
    // del ancho de la pantalla: en el Panel ocupa todo el ancho y va en fila;
    // dentro de la tarjeta angosta de la propiedad (340px) los botones van abajo.
    <div className="@container">
      <div className="flex flex-col gap-3 rounded-xl border border-danger bg-danger-bg px-4.5 py-4 @lg:flex-row @lg:items-center @lg:justify-between">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-danger">
            La factura de {inquilino} no se ha enviado
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">
            {direccion}
            {motivo ? ` · ${motivo}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <BotonCopiarEnlace ruta={`/pagar/${facturaId}`} etiqueta="Copiar enlace de pago" />
          <form action={marcarFacturaEnviadaManual}>
            <input type="hidden" name="facturaId" value={facturaId} />
            <button
              type="submit"
              className="rounded-[8px] bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
            >
              Ya se la envié
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
