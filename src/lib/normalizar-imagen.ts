// El iPhone sube fotos en formato HEIC/HEIF cuando se toman con la cámara
// nativa (los inputs <input type="file" capture="..."> de las pantallas de
// verificación usan justamente esa cámara). Ningún navegador puede mostrar
// HEIC en un <img>, así que sin esto las fotos de cédula/selfie de
// cualquier usuario de iPhone quedarían guardadas pero invisibles — pasó de
// verdad probando con la cuenta real de Thomas. Se convierte a JPEG aquí,
// en el servidor, antes de guardar y antes de correr el OCR (tesseract.js
// tampoco lee HEIC). heic-convert usa libheif-js (WASM), sin binarios
// nativos — mismo criterio que tesseract.js y face-api en este proyecto.
export async function normalizarImagen(
  buffer: Buffer<ArrayBuffer>,
  tipo: string,
  nombreArchivo?: string,
): Promise<{ buffer: Buffer<ArrayBuffer>; tipo: string }> {
  const esHeic =
    /heic|heif/i.test(tipo) || (nombreArchivo ? /\.hei[cf]$/i.test(nombreArchivo) : false);

  if (!esHeic) {
    return { buffer, tipo };
  }

  const convert = (await import("heic-convert")).default;
  const jpegBuffer = await convert({ buffer, format: "JPEG", quality: 0.9 });
  return { buffer: Buffer.from(jpegBuffer) as Buffer<ArrayBuffer>, tipo: "image/jpeg" };
}
