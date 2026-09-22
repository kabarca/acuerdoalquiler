import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js resuelve la ruta de su worker en tiempo de ejecución — si
  // Turbopack lo empaqueta, esa ruta se rompe (ver error "Cannot find
  // module .../worker-script/node/index.js"). Se deja como paquete externo
  // para que Node lo resuelva normal desde node_modules. heic-convert
  // (conversión de fotos HEIC de iPhone) carga un WASM (libheif-js) de forma
  // parecida, así que se deja igual por si acaso.
  serverExternalPackages: ["tesseract.js", "heic-convert"],
};

export default nextConfig;
