type ArrendadorDatosBancarios = {
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

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink-faint">{etiqueta}</span>
      <span className="text-right font-semibold">{valor ?? "Sin configurar"}</span>
    </div>
  );
}

// Datos bancarios que se le muestran al inquilino para transferir — usado
// tanto en la página de pago como en la invitación a configurar método de
// pago. Si la cuenta del arrendador es internacional, agrega los campos de
// wire transfer (SWIFT, país, direcciones).
export function DatosTransferencia({
  arrendador,
  referencia,
}: {
  arrendador: ArrendadorDatosBancarios;
  referencia?: string;
}) {
  const internacional = arrendador.tipoCuentaBancaria === "INTERNACIONAL";

  return (
    <div className="flex flex-col gap-2 rounded-[10px] bg-bg px-4.5 py-4 text-[13.5px]">
      {internacional && (
        <span className="mb-1 w-fit rounded-full bg-primary-light px-2.5 py-1 text-[11.5px] font-bold text-primary">
          Transferencia internacional
        </span>
      )}
      <Fila etiqueta="Banco" valor={arrendador.banco} />
      <Fila etiqueta={internacional ? "Número de cuenta o IBAN" : "Cuenta IBAN"} valor={arrendador.cuentaIban} />
      <Fila etiqueta="Titular" valor={arrendador.titularCuenta} />
      {internacional && (
        <>
          <Fila etiqueta="Código SWIFT/BIC" valor={arrendador.swiftBic} />
          <Fila etiqueta="País del banco" valor={arrendador.paisBanco} />
          <Fila etiqueta="Dirección del banco" valor={arrendador.direccionBanco} />
          <Fila etiqueta="Dirección del titular" valor={arrendador.direccionTitular} />
          {arrendador.numeroRuta && <Fila etiqueta="Número de ruta (ABA)" valor={arrendador.numeroRuta} />}
        </>
      )}
      {referencia && <Fila etiqueta="Referencia" valor={referencia} />}
    </div>
  );
}
