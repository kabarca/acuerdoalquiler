import Link from "next/link";
import { Fira_Sans } from "next/font/google";

// Mismo tema público que (marketing) — ver CLAUDE.md "Tono y
// posicionamiento de marca". Instancia propia de Fira Sans porque Next no
// comparte el loader de next/font entre layouts de distintos route groups.
const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

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
    <div className={`${firaSans.variable} theme-public font-fira flex min-h-screen bg-public-bg`}>
      <div className="hidden w-[360px] shrink-0 flex-col justify-between bg-public-ink px-10 py-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
          </div>
          <span className="text-lg font-semibold text-white">Acuerdo Alquiler</span>
        </Link>

        <div className="flex flex-col gap-5">
          <h2 className="text-[26px] leading-snug font-light text-white">
            El cobro y el <span className="text-public-accent">registro de pago</span> de sus inquilinos.
          </h2>
          <div className="flex flex-col gap-3.5">
            {BENEFICIOS.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AF8462" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
                <span className="text-sm text-white/75">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="text-[13px] text-white/50">© 2026 Acuerdo Alquiler</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
