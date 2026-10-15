import { Fira_Sans } from "next/font/google";

// Tipografía del sitio público — ver CLAUDE.md "Tono y posicionamiento de
// marca": Fira Sans reemplaza a Space Grotesk/Public Sans solo acá, nunca en
// el panel autenticado. `theme-public` activa la regla scoped en
// globals.css que además cambia la fuente de los encabezados.
const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${firaSans.variable} theme-public font-fira`}>
      {children}
    </div>
  );
}
