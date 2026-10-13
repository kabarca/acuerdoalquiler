import Link from "next/link";

const BENEFICIOS = [
  "Cobro por transferencia bancaria",
  "Recordatorios y alertas automáticas",
  "Panel con todas sus propiedades",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[360px] shrink-0 flex-col justify-between bg-primary px-10 py-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
          </div>
          <span className="font-heading text-lg font-bold text-white">Acuerdo Alquiler</span>
        </Link>

        <div className="flex flex-col gap-5">
          <h2 className="font-heading text-[26px] leading-snug font-semibold text-white">
            Comience a cobrar el arriendo sin complicaciones.
          </h2>
          <div className="flex flex-col gap-3.5">
            {BENEFICIOS.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
                <span className="text-sm text-primary-light/90">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="text-[13px] text-primary-light/70">© 2026 Acuerdo Alquiler</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
