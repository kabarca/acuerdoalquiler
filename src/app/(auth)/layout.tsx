import Link from "next/link";

const BENEFICIOS = [
  "Factura automática cada mes",
  "Tu inquilino paga con tarjeta, sin transferencias",
  "Recordatorios automáticos si alguien se atrasa",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-10 py-10 text-primary-foreground lg:flex">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          RentaCR
        </Link>

        <div>
          <h2 className="max-w-sm text-3xl font-semibold text-balance">
            Cobra el alquiler sin perseguir a nadie
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {BENEFICIOS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-blue-50">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 text-foreground shadow-lg">
          <p className="text-xs text-muted">condominio parques del sol</p>
          <p className="text-sm font-medium">Factura de alquiler</p>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium">
            <span>Monto</span>
            <span>₡400 000</span>
          </div>
          <div className="mt-3 rounded-lg bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground">
            Pagar con tarjeta
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
