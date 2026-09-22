// Comparación de rostros — corre en el navegador (no en el servidor) con
// face-api.js/TensorFlow.js. Ver la nota larga en CLAUDE.md sobre por qué
// no se usa Python/face_recognition aquí. Usado por la verificación de
// identidad del inquilino (verificar/[token]).

export type ResultadoMatch = {
  coincide: boolean | null;
  distancia: number | null;
  sinRostro: boolean;
};

let modelosCargados = false;

async function cargarModelos() {
  const faceapi = await import("@vladmandic/face-api");
  if (!modelosCargados) {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    modelosCargados = true;
  }
  return faceapi;
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

export async function compararRostros(documentoFile: File, selfieFile: File): Promise<ResultadoMatch> {
  try {
    const faceapi = await cargarModelos();
    const options = new faceapi.TinyFaceDetectorOptions();

    const [imgDocumento, imgSelfie] = await Promise.all([
      fileToImage(documentoFile),
      fileToImage(selfieFile),
    ]);

    const [resDocumento, resSelfie] = await Promise.all([
      faceapi.detectSingleFace(imgDocumento, options).withFaceLandmarks().withFaceDescriptor(),
      faceapi.detectSingleFace(imgSelfie, options).withFaceLandmarks().withFaceDescriptor(),
    ]);

    if (!resDocumento || !resSelfie) {
      return { coincide: null, distancia: null, sinRostro: true };
    }

    const distancia = faceapi.euclideanDistance(resDocumento.descriptor, resSelfie.descriptor);
    return { coincide: distancia < 0.6, distancia, sinRostro: false };
  } catch {
    return { coincide: null, distancia: null, sinRostro: true };
  }
}
