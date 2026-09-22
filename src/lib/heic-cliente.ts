// Convierte HEIC/HEIF a JPEG en el navegador, antes de mostrar la vista
// previa y antes de compararRostros() — face-api tampoco puede leer HEIC,
// así que sin esto el match de rostros falla en silencio para cualquiera
// que suba una foto tomada con la cámara nativa de un iPhone (pasó de
// verdad probando con una cuenta real). También se convierte otra vez en
// el servidor como respaldo (ver lib/normalizar-imagen.ts) por si esto
// falla o el archivo llega por otra vía.
export async function convertirSiEsHeic(file: File): Promise<File> {
  const esHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (!esHeic) {
    return file;
  }

  try {
    const convert = (await import("heic-convert/browser")).default;
    const buffer = new Uint8Array(await file.arrayBuffer());
    const jpegBytes = await convert({ buffer, format: "JPEG", quality: 0.9 });
    return new File([jpegBytes.buffer as ArrayBuffer], file.name.replace(/\.hei[cf]$/i, ".jpg"), {
      type: "image/jpeg",
    });
  } catch {
    // Si la conversión falla, seguimos con el archivo original — el
    // servidor lo va a intentar convertir de nuevo al recibirlo.
    return file;
  }
}
