import localFont from "next/font/local";

// Las tipografías viven dentro del proyecto (src/app/fonts) en vez de bajarse
// de Google al compilar con next/font/google: el 2026-11-10 el despliegue en
// Vercel falló porque esa descarga falló (module-not-found en
// next/font/google). Así la compilación ya no depende de la red.
// Archivos: subconjunto "latin" de Google Fonts (cubre tildes, ñ, ¿ y ¡).

export const spaceGrotesk = localFont({
  variable: "--font-space-grotesk",
  src: "../app/fonts/SpaceGrotesk-500-700.woff2",
  weight: "500 700",
  display: "swap",
});

export const publicSans = localFont({
  variable: "--font-public-sans",
  src: "../app/fonts/PublicSans-400-700.woff2",
  weight: "400 700",
  display: "swap",
});

export const firaSans = localFont({
  variable: "--font-fira-sans",
  src: [
    { path: "../app/fonts/FiraSans-300.woff2", weight: "300" },
    { path: "../app/fonts/FiraSans-400.woff2", weight: "400" },
    { path: "../app/fonts/FiraSans-500.woff2", weight: "500" },
    { path: "../app/fonts/FiraSans-600.woff2", weight: "600" },
    { path: "../app/fonts/FiraSans-700.woff2", weight: "700" },
    { path: "../app/fonts/FiraSans-800.woff2", weight: "800" },
  ],
  display: "swap",
});
