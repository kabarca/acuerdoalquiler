import { convertirSiEsHeic } from "@/lib/heic-cliente";

const LADO_MAXIMO = 1600;
const CALIDAD_JPEG = 0.85;

// Prepara una foto tomada con el celular antes de analizarla y subirla:
//  1. HEIC (iPhone) → JPEG.
//  2. Reduce a un máximo de 1600 px por lado y la guarda como JPEG.
// Por qué: una foto de celular pesa 3–10 MB. Las Server Actions de Next
// rechazan cuerpos de más de 1 MB por defecto, y las funciones de Vercel no
// aceptan más de 4,5 MB en total — con cédula + selfie la verificación fallaba
// al enviar. A 1600 px cada foto queda en ~300–700 KB y se sigue leyendo bien
// (rostro y texto de la cédula). Además el detector de rostros trabaja mejor y
// más rápido con imágenes de este tamaño.
export async function prepararFoto(file: File): Promise<File> {
  const convertida = await convertirSiEsHeic(file);

  try {
    const bitmap = await createImageBitmap(convertida, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) return convertida;
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, "image/jpeg", CALIDAD_JPEG));
    if (!blob || (escala === 1 && blob.size >= convertida.size)) return convertida;

    return new File([blob], convertida.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // Si el navegador no puede reducirla, se sigue con la original.
    return convertida;
  }
}
