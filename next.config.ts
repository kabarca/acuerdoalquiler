import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js resuelve la ruta de su worker en tiempo de ejecución — si
  // Turbopack lo empaqueta, esa ruta se rompe (ver error "Cannot find
  // module .../worker-script/node/index.js"). Se deja como paquete externo
  // para que Node lo resuelva normal desde node_modules. heic-convert
  // (conversión de fotos HEIC de iPhone) carga un WASM (libheif-js) de forma
  // parecida, así que se deja igual por si acaso.
  serverExternalPackages: ["tesseract.js", "heic-convert"],
  // Las fotos de la verificación (cédula + selfie) viajan en una Server Action.
  // El límite por defecto es 1 MB y hacía fallar el envío. Las fotos se reducen
  // en el navegador (lib/imagen-cliente.ts); este margen cubre ambas fotos y
  // queda por debajo de los 4,5 MB que aceptan las funciones de Vercel.
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
