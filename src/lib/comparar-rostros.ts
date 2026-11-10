// Comparación de rostros — corre en el navegador (no en el servidor) con
// face-api.js/TensorFlow.js. Ver la nota larga en CLAUDE.md sobre por qué
// no se usa Python/face_recognition aquí. Usado por la verificación de
// identidad del inquilino (verificar/[token]).

export type ResultadoMatch = {
  coincide: boolean | null;
  distancia: number | null;
  sinRostro: boolean;
  // Qué foto falló, para decirle al usuario cuál repetir.
  sinRostroCedula?: boolean;
  sinRostroSelfie?: boolean;
};

type FaceApi = typeof import("@vladmandic/face-api");

let modelosCargados = false;

async function cargarModelos(): Promise<FaceApi> {
  const faceapi = await import("@vladmandic/face-api");
  if (!modelosCargados) {
    // WebGL falla en algunos celulares (poca memoria, modo ahorro); en ese
    // caso se cae a CPU, que es más lenta pero funciona.
    // (Los tipos de face-api no exponen setBackend/ready, pero el objeto sí los tiene.)
    const tf = faceapi.tf as unknown as { setBackend(nombre: string): Promise<boolean>; ready(): Promise<void> };
    try {
      await tf.setBackend("webgl");
      await tf.ready();
    } catch {
      await tf.setBackend("cpu");
      await tf.ready();
    }
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    modelosCargados = true;
  }
  return faceapi;
}

function archivoAImagen(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

// Dibuja la imagen en un canvas, girada 0/90/180/270°: una cédula fotografiada
// "de lado" no se detecta si no se gira.
function aCanvas(img: HTMLImageElement, grados: number): HTMLCanvasElement {
  const girada = grados === 90 || grados === 270;
  const canvas = document.createElement("canvas");
  canvas.width = girada ? img.naturalHeight : img.naturalWidth;
  canvas.height = girada ? img.naturalWidth : img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((grados * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return canvas;
}

// El rostro de una cédula es pequeño dentro de la foto y el detector rápido
// (Tiny) lo pierde con la configuración por defecto. Se prueba con varias
// resoluciones de análisis, un umbral más permisivo y, si hace falta, la foto
// girada. Se devuelve el primer rostro que aparece.
async function detectarRostro(faceapi: FaceApi, img: HTMLImageElement, girosPermitidos: number[]) {
  for (const grados of girosPermitidos) {
    const canvas = aCanvas(img, grados);
    for (const inputSize of [416, 512, 608]) {
      const opciones = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold: 0.3 });
      const resultado = await faceapi.detectSingleFace(canvas, opciones).withFaceLandmarks().withFaceDescriptor();
      if (resultado) return resultado;
    }
  }
  return null;
}

export async function compararRostros(documentoFile: File, selfieFile: File): Promise<ResultadoMatch> {
  try {
    const faceapi = await cargarModelos();
    const [imgDocumento, imgSelfie] = await Promise.all([archivoAImagen(documentoFile), archivoAImagen(selfieFile)]);

    // De a uno (no en paralelo): analizar las dos a la vez agota la memoria
    // de la GPU en celulares modestos.
    const resDocumento = await detectarRostro(faceapi, imgDocumento, [0, 90, 270, 180]);
    const resSelfie = await detectarRostro(faceapi, imgSelfie, [0, 90, 270]);

    if (!resDocumento || !resSelfie) {
      return {
        coincide: null,
        distancia: null,
        sinRostro: true,
        sinRostroCedula: !resDocumento,
        sinRostroSelfie: !resSelfie,
      };
    }

    const distancia = faceapi.euclideanDistance(resDocumento.descriptor, resSelfie.descriptor);
    return { coincide: distancia < 0.6, distancia, sinRostro: false };
  } catch {
    return { coincide: null, distancia: null, sinRostro: true };
  }
}
