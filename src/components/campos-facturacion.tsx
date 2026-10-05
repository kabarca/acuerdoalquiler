const DIAS = Array.from({ length: 28 }, (_, i) => i + 1);

const selectClass =
  "w-full rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary";

// Las tres fechas con las que el arrendador programa la facturación
// automática de un inquilino (ver lib/facturacion.ts).
export function CamposFacturacion({
  diaGeneracion = 1,
  diaEnvio = 1,
  diaCobro = 5,
  compacto = false,
}: {
  diaGeneracion?: number;
  diaEnvio?: number;
  diaCobro?: number;
  compacto?: boolean;
}) {
  const campos = [
    {
      name: "diaGeneracion",
      label: "Generar la factura el día",
      ayuda: "El sistema la crea solo ese día de cada mes.",
      valor: diaGeneracion,
    },
    {
      name: "diaEnvio",
      label: "Enviarla al inquilino el día",
      ayuda: "Le llega por correo ese día (no antes de generarse).",
      valor: diaEnvio,
    },
    {
      name: "diaCobro",
      label: "Fecha máxima de pago: día",
      ayuda: "Aparece en la factura. Si es antes del día de envío, cae en el mes siguiente.",
      valor: diaCobro,
    },
  ];

  return (
    <div className={`grid grid-cols-1 gap-4 ${compacto ? "" : "sm:grid-cols-3"}`}>
      {campos.map((c) => (
        <div key={c.name} className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">{c.label}</label>
          <select name={c.name} className={selectClass} defaultValue={c.valor}>
            {DIAS.map((d) => (
              <option key={d} value={d}>
                Día {d} de cada mes
              </option>
            ))}
          </select>
          <p className="text-[12px] leading-snug text-ink-faint">{c.ayuda}</p>
        </div>
      ))}
    </div>
  );
}
