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
// (Tiny) lo pierde con la configuración por defecto. Se prueban pocas
// combinaciones (resolución de análisis + giro de la foto), de la más probable
// a la menos, con un umbral permisivo. En un celular modesto cada intento puede
// tardar segundos, así que hay un tiempo límite total: si se agota, se sigue
// sin comparación automática y el arrendador revisa las fotos a mano. Nunca debe
// quedarse "cargando" para siempre.
type Intento = { grados: number; inputSize: number };

const INTENTOS_DOCUMENTO: Intento[] = [
  { grados: 0, inputSize: 416 },
  { grados: 0, inputSize: 608 },
  { grados: 90, inputSize: 512 },
  { grados: 270, inputSize: 512 },
];
const INTENTOS_SELFIE: Intento[] = [
  { grados: 0, inputSize: 416 },
  { grados: 0, inputSize: 608 },
  { grados: 90, inputSize: 512 },
];

async function detectarRostro(faceapi: FaceApi, img: HTMLImageElement, intentos: Intento[], limite: number) {
  let canvas: HTMLCanvasElement | null = null;
  let gradosActual = -1;
  for (const { grados, inputSize } of intentos) {
    if (Date.now() > limite) return null;
    if (grados !== gradosActual) {
      canvas = aCanvas(img, grados);
      gradosActual = grados;
    }
    const opciones = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold: 0.3 });
    const resultado = await faceapi.detectSingleFace(canvas!, opciones).withFaceLandmarks().withFaceDescriptor();
    if (resultado) return resultado;
  }
  return null;
}

function conTiempoLimite<T>(promesa: Promise<T>, ms: number, valorSiSeAcaba: T): Promise<T> {
  return new Promise((resolver) => {
    const reloj = setTimeout(() => resolver(valorSiSeAcaba), ms);
    promesa.then(
      (v) => {
        clearTimeout(reloj);
        resolver(v);
      },
      () => {
        clearTimeout(reloj);
        resolver(valorSiSeAcaba);
      },
    );
  });
}

const SIN_COMPARACION: ResultadoMatch = { coincide: null, distancia: null, sinRostro: true };
const TIEMPO_MODELOS_MS = 25_000; // bajar ~7 MB de modelos con datos móviles
const TIEMPO_ANALISIS_MS = 20_000;

export async function compararRostros(documentoFile: File, selfieFile: File): Promise<ResultadoMatch> {
  const faceapi = await conTiempoLimite(cargarModelos(), TIEMPO_MODELOS_MS, null);
  if (!faceapi) return SIN_COMPARACION;
  return conTiempoLimite(analizar(faceapi, documentoFile, selfieFile), TIEMPO_ANALISIS_MS + 5_000, SIN_COMPARACION);
}

async function analizar(faceapi: FaceApi, documentoFile: File, selfieFile: File): Promise<ResultadoMatch> {
  try {
    const [imgDocumento, imgSelfie] = await Promise.all([archivoAImagen(documentoFile), archivoAImagen(selfieFile)]);
    const limite = Date.now() + TIEMPO_ANALISIS_MS;

    // De a uno (no en paralelo): analizar las dos a la vez agota la memoria
    // de la GPU en celulares modestos.
    const resDocumento = await detectarRostro(faceapi, imgDocumento, INTENTOS_DOCUMENTO, limite);
    const resSelfie = await detectarRostro(faceapi, imgSelfie, INTENTOS_SELFIE, limite);

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
