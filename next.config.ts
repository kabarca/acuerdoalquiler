import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js resuelve la ruta de su worker en tiempo de ejecución — si
  // Turbopack lo empaqueta, esa ruta se rompe (ver error "Cannot find
  // module .../worker-script/node/index.js"). Se deja como paquete externo
  // para que Node lo resuelva normal desde node_modules.
  serverExternalPackages: ["tesseract.js"],
};

export default nextConfig;
