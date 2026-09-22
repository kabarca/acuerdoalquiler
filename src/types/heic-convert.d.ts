// heic-convert no publica tipos — se usa tanto en el servidor
// (src/lib/normalizar-imagen.ts) como en el navegador, vía el subpath
// "/browser" (src/lib/heic-cliente.ts), para convertir las fotos HEIC que
// suben los iPhones.
declare module "heic-convert" {
  type Formato = "JPEG" | "PNG";

  interface OpcionesConversion {
    buffer: Buffer | Uint8Array;
    format: Formato;
    quality?: number;
  }

  function convert(opciones: OpcionesConversion): Promise<Uint8Array>;

  export default convert;
}

declare module "heic-convert/browser" {
  export { default } from "heic-convert";
}
