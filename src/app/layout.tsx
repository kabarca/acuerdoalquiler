import type { Metadata } from "next";
import { spaceGrotesk, publicSans } from "@/lib/fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acuerdo Alquiler",
  description: "Cobro de arriendo por transferencia bancaria para arrendadores en Costa Rica",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${publicSans.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
