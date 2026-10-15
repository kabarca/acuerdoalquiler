import type { Metadata } from "next";
import { Space_Grotesk, Public_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

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
