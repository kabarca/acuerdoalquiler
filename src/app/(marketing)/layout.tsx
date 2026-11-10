import { firaSans } from "@/lib/fuentes";

// Tipografía del sitio público — ver CLAUDE.md "Tono y posicionamiento de
// marca": Fira Sans reemplaza a Space Grotesk/Public Sans solo acá, nunca en
// el panel autenticado. `theme-public` activa la regla scoped en
// globals.css que además cambia la fuente de los encabezados.
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
