"use client";

import { useState } from "react";
import { procesarVerificacion } from "./actions";

type Paso = "inicio" | "cedula" | "selfie" | "procesando" | "confirmar" | "enviando" | "listo" | "error";

type ResultadoMatch = {
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

async function compararRostros(cedulaFile: File, selfieFile: File): Promise<ResultadoMatch> {
  try {
    const faceapi = await cargarModelos();
    const options = new faceapi.TinyFaceDetectorOptions();

    const [imgCedula, imgSelfie] = await Promise.all([fileToImage(cedulaFile), fileToImage(selfieFile)]);

    const [resCedula, resSelfie] = await Promise.all([
      faceapi.detectSingleFace(imgCedula, options).withFaceLandmarks().withFaceDescriptor(),
      faceapi.detectSingleFace(imgSelfie, options).withFaceLandmarks().withFaceDescriptor(),
    ]);

    if (!resCedula || !resSelfie) {
      return { coincide: null, distancia: null, sinRostro: true };
    }

    const distancia = faceapi.euclideanDistance(resCedula.descriptor, resSelfie.descriptor);
    return { coincide: distancia < 0.6, distancia, sinRostro: false };
  } catch {
    return { coincide: null, distancia: null, sinRostro: true };
  }
}

export function CapturaForm({
  token,
  nombreInquilino,
  direccionPropiedad,
}: {
  token: string;
  nombreInquilino: string;
  direccionPropiedad: string;
}) {
  const [paso, setPaso] = useState<Paso>("inicio");
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [cedulaPreview, setCedulaPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const primerNombre = nombreInquilino.split(" ")[0];

  function elegirCedula(file: File) {
    setCedulaFile(file);
    setCedulaPreview(URL.createObjectURL(file));
    setPaso("selfie");
  }

  async function elegirSelfie(file: File) {
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
    setPaso("procesando");

    if (cedulaFile) {
      const res = await compararRostros(cedulaFile, file);
      setResultado(res);
    }
    setPaso("confirmar");
  }

  async function enviar() {
    if (!cedulaFile || !selfieFile) return;
    setPaso("enviando");
    setError(null);

    const formData = new FormData();
    formData.set("token", token);
    formData.set("cedula", cedulaFile);
    formData.set("selfie", selfieFile);
    if (resultado && !resultado.sinRostro) {
      formData.set("coincide", String(resultado.coincide));
      formData.set("distancia", String(resultado.distancia));
    }

    const res = await procesarVerificacion(formData);
    if (res.ok) {
      setPaso("listo");
    } else {
      setError(res.error);
      setPaso("error");
    }
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-surface shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
      <div className="flex flex-col gap-1.5 border-b border-border px-8 py-7">
        <span className="text-[12.5px] font-bold text-ink-faint">VERIFICACIÓN DE IDENTIDAD</span>
        <h1 className="text-[21px] font-semibold">Confirme que es usted</h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          Su arrendador le pide confirmar su identidad para <strong>{direccionPropiedad}</strong>. Solo toma
          un minuto, directo desde su celular.
        </p>
      </div>

      <div className="flex flex-col gap-5 px-8 py-7">
        {paso === "inicio" && (
          <>
            <div className="flex flex-col gap-3 text-[13.5px] text-ink-soft">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">1</span>
                Foto de su cédula
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">2</span>
                Una selfie
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPaso("cedula")}
              className="rounded-[10px] bg-primary py-3.75 text-[15px] font-bold text-white hover:bg-primary-dark"
            >
              Comenzar, {primerNombre}
            </button>
          </>
        )}

        {paso === "cedula" && (
          <CapturaInput
            titulo="Foto de su cédula"
            descripcion="Colóquela sobre una superficie plana, con buena luz."
            capture="environment"
            onFile={elegirCedula}
          />
        )}

        {paso === "selfie" && (
          <>
            {cedulaPreview && (
              <img src={cedulaPreview} alt="Cédula" className="h-24 w-full rounded-lg border border-border object-cover" />
            )}
            <CapturaInput
              titulo="Ahora una selfie"
              descripcion="Mire de frente a la cámara, en un lugar con buena luz."
              capture="user"
              onFile={elegirSelfie}
            />
          </>
        )}

        {paso === "procesando" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-light border-t-primary" />
            <p className="text-[14px] font-semibold text-ink-soft">Comparando las fotos…</p>
          </div>
        )}

        {paso === "confirmar" && cedulaPreview && selfiePreview && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Cédula</span>
                <img src={cedulaPreview} alt="Cédula" className="aspect-[4/3] w-full rounded-lg border border-border object-cover" />
                <button type="button" onClick={() => setPaso("cedula")} className="text-xs font-semibold text-accent">
                  Tomar de nuevo
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Selfie</span>
                <img src={selfiePreview} alt="Selfie" className="aspect-[4/3] w-full rounded-lg border border-border object-cover" />
                <button type="button" onClick={() => setPaso("selfie")} className="text-xs font-semibold text-accent">
                  Tomar de nuevo
                </button>
              </div>
            </div>

            {resultado?.sinRostro ? (
              <div className="rounded-[10px] bg-bg px-4 py-3.5 text-[13px] text-ink-soft">
                No pudimos comparar las fotos automáticamente. No hay problema — su arrendador las revisará
                directamente.
              </div>
            ) : (
              <div
                className={`rounded-[10px] px-4 py-3.5 text-[13px] font-semibold ${
                  resultado?.coincide ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
                }`}
              >
                {resultado?.coincide
                  ? "Las fotos parecen ser de la misma persona."
                  : "No estamos seguros de que coincidan — su arrendador las revisará."}
              </div>
            )}

            <button
              type="button"
              onClick={enviar}
              className="rounded-[10px] bg-primary py-3.75 text-[15px] font-bold text-white hover:bg-primary-dark"
            >
              Confirmar y enviar
            </button>
          </>
        )}

        {paso === "enviando" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-light border-t-primary" />
            <p className="text-[14px] font-semibold text-ink-soft">Enviando…</p>
          </div>
        )}

        {paso === "listo" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
            </div>
            <p className="text-[16px] font-semibold">¡Listo, {primerNombre}!</p>
            <p className="text-[13.5px] text-ink-soft">
              Su arrendador ya recibió su información y la revisará pronto.
            </p>
          </div>
        )}

        {paso === "error" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-bg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            </div>
            <p className="text-[14.5px] font-semibold text-danger">{error}</p>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-[10px] bg-bg px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-soft">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>
          Sus fotos quedan cifradas y solo las puede ver su arrendador.
        </div>
      </div>
    </div>
  );
}

function CapturaInput({
  titulo,
  descripcion,
  capture,
  onFile,
}: {
  titulo: string;
  descripcion: string;
  capture: "environment" | "user";
  onFile: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-[1.5px] border-dashed border-border bg-bg px-5 py-9 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-light text-primary">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.5a2 2 0 0 1 2-2h1.2l.9-1.4A2 2 0 0 1 9.8 4h4.4a2 2 0 0 1 1.7 1.1l.9 1.4H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="3.5"/></svg>
      </div>
      <div>
        <p className="text-[14px] font-bold">{titulo}</p>
        <p className="mt-0.5 text-xs text-ink-faint">{descripcion}</p>
      </div>
      <input
        type="file"
        accept="image/*"
        capture={capture}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}
