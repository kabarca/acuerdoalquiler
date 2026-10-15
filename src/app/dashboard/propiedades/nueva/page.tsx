import { NuevaPropiedadForm, Step } from "./nueva-propiedad-form";

export default function NuevaPropiedadPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-semibold">Registre su propiedad e inquilino</h1>
        <p className="text-[15px] text-ink-soft">
          Estos datos se usarán para generar la factura y activar el cobro automático.
        </p>
      </div>

      <div className="my-8 flex items-center">
        <Step n={1} label="Propiedad" activo />
        <div className="mx-3.5 h-[1.5px] w-16 bg-border" />
        <Step n={2} label="Inquilino" activo />
        <div className="mx-3.5 h-[1.5px] w-16 bg-border" />
        <Step n={3} label="Pago" activo={false} />
      </div>

      <NuevaPropiedadForm />
    </div>
  );
}
