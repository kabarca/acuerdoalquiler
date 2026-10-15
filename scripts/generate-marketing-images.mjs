#!/usr/bin/env node
// Genera las imágenes del sitio público (home) con la API de Kie.ai, usando
// los prompts definidos en la guía de estilo:
// https://claude.ai/artifact/3EQNGHp5ZKHsL34y1zDVms — sección 22, "Imágenes".
//
// Soporta dos motores (campo "engine" por prompt):
//   - "gpt-image": GPT Image 2.5 (kie.ai/gpt-image-2-5) — mejor siguiendo
//     instrucciones de encuadre/composición precisas (recortes dramáticos,
//     espacio negativo deliberado). Usado por defecto desde 2026-10-13: la
//     primera tanda con Flux salió demasiado "foto de inmobiliaria" en vez
//     del encuadre gráfico/editorial que se buscaba (ver sección 20 del
//     artifact — comparación con banners reales de bancos).
//   - "flux": Flux Kontext Pro — más rápido, buena fotorrealidad, pero más
//     literal/genérico en el encuadre. Se deja disponible por si algún
//     prompt puntual rinde mejor ahí.
//
// Requiere KIE_API_KEY en .env.local (cuenta propia de Kie.ai, ver
// https://kie.ai — Dashboard > API Keys). Nunca se commitea esa clave: vive
// solo en .env.local, que está en .gitignore.
//
// Uso: npm run generate:images
//      npm run generate:images -- --only hero,paso-1

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Cargar .env.local a mano (sin agregar dotenv como dependencia) ───────
function cargarEnvLocal() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const linea of readFileSync(envPath, "utf8").split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const idx = limpia.indexOf("=");
    if (idx === -1) continue;
    const clave = limpia.slice(0, idx).trim();
    let valor = limpia.slice(idx + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (!(clave in process.env)) process.env[clave] = valor;
  }
}
cargarEnvLocal();

const API_KEY = process.env.KIE_API_KEY;
const BASE_URL = "https://api.kie.ai/api/v1";
const OUTDIR = join(ROOT, "public", "images", "marketing");
const GPT_IMAGE_MODEL = "gpt-image-2-5-sunburst-text-to-image";

if (!API_KEY) {
  console.error(
    "❌ Falta KIE_API_KEY. Agrégala a .env.local (ver .env.example) con tu " +
      "propia clave de https://kie.ai — Dashboard > API Keys.",
  );
  process.exit(1);
}

// ─── Prompts (guía de estilo, sección 22) ──────────────────────────────────
// Cada entrada corresponde a un bloque "listo para pegar" de Imagenes.dc.html
// en el artifact. Mantener este archivo y esa sección sincronizados a mano.
//
// hero / seccion-oscura / blog se reescribieron el 2026-10-13 a partir de 4
// banners de referencia que Kevin señaló (bancos de EE.UU., carpeta
// ~/Desktop): recorte gráfico muy cerrado sobre el edificio, ángulo bajo u
// oblicuo extremo, patrón geométrico de balcones/ventanas como protagonista,
// gran espacio negativo de cielo para texto — nunca el edificio completo con
// parqueo y jardín alrededor como una foto de inmobiliaria.
const PROMPTS = [
  {
    key: "hero",
    archivo: "hero-home.png",
    engine: "gpt-image",
    aspectRatio: "3:2",
    prompt:
      "Dramatic architectural photograph of a modern residential apartment building in Costa Rica, shot from a low oblique angle so the building occupies roughly the right third of the frame, vast clean gradient blue sky filling the rest of the frame as negative space for text overlay, geometric balcony railings and vertical concrete fins catching crisp sunlight, vibrant saturated color grading, no people, no cars, no landscaping visible, premium editorial real-estate photography, sharp focus, high-end corporate banner style.",
  },
  {
    key: "paso-1",
    archivo: "paso-1-registro.png",
    engine: "gpt-image",
    aspectRatio: "4:3",
    prompt:
      "Overhead photograph of a person's hands holding a smartphone displaying a plain rental invoice screen with no readable text, resting on a wooden desk next to a printed rental contract and a Costa Rican identification card, soft natural window light from the side, shallow depth of field, warm neutral tones, documentary finance photography, photorealistic, no faces visible, sharp focus on hands.",
  },
  {
    key: "paso-2",
    archivo: "paso-2-factura.png",
    engine: "gpt-image",
    aspectRatio: "4:3",
    prompt:
      "Close-up photograph of a hand holding a smartphone showing a simple payment reminder notification with no readable text, blurred abstract background of a bright living room, soft daylight, shallow depth of field, cool neutral color grading, documentary lifestyle photography, photorealistic, generic blurred interface, no visible logos.",
  },
  {
    key: "paso-3",
    archivo: "paso-3-verificacion.png",
    engine: "gpt-image",
    aspectRatio: "4:3",
    prompt:
      "Overhead photograph of two hands reviewing a tenant file folder with printed documents and a Costa Rican identification card on a dark wood desk, a pen resting beside the papers, soft directional daylight, cool neutral tones, documentary compliance photography, high detail, photorealistic, no faces visible, no readable text on documents.",
  },
  {
    key: "seccion-oscura",
    archivo: "seccion-oscura-producto.png",
    engine: "gpt-image",
    aspectRatio: "16:9",
    prompt:
      "Extreme low-angle photograph looking straight up at two modern glass and concrete residential towers in Costa Rica converging toward the sky, dramatic wide-angle architectural perspective, repeating geometric grid of windows and balconies, deep blue dusk sky transitioning to warm light at the horizon, a few warm window lights beginning to turn on, high contrast reflective glass, no people visible, no ground level visible, abstract premium editorial real-estate photography, sharp and cinematic.",
  },
  {
    key: "cita-fondo",
    archivo: "cita-institucional-fondo.png",
    engine: "gpt-image",
    aspectRatio: "4:3",
    prompt:
      "Macro photograph of a stack of folded legal documents and paper, soft grayscale with a subtle cool blue tint, shallow depth of field, abstract minimal texture, elegant editorial photography, photorealistic, no readable text.",
  },
  {
    key: "equipo",
    archivo: "retrato-equipo.png",
    engine: "gpt-image",
    aspectRatio: "1:1",
    prompt:
      "Professional corporate headshot photograph of a Latin American businessperson in business-casual attire, warm genuine expression, soft studio lighting, plain light gray background, shot straight-on at eye level, photorealistic, high detail, editorial corporate photography.",
  },
  {
    key: "blog",
    archivo: "miniatura-articulo.png",
    engine: "gpt-image",
    aspectRatio: "4:3",
    prompt:
      "Graphic architectural photograph of a modern white residential apartment building facade in Costa Rica, shot from a dramatic diagonal low angle emphasizing a repeating pattern of glass balconies and dark window frames receding into the distance, crisp saturated blue sky gradient in the upper corner, strong geometric rhythm, no people, no cars visible, clean and minimal, premium editorial real-estate photography, sharp focus, vibrant color grading.",
  },
];

// Nota: ninguno de los dos motores acepta un campo de negative prompt
// separado en kie.ai — la lista de "qué evitar" de la guía de estilo
// (sección 23) ya está incorporada como frases positivas dentro de cada
// prompt de arriba ("no people visible", "no readable text", etc.).

// ─── Cliente de la API ──────────────────────────────────────────────────
async function llamarApi(method, path, body) {
  const resp = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function enviarTrabajoFlux({ prompt, aspectRatio }) {
  const resp = await llamarApi("POST", "/flux/kontext/generate", {
    prompt,
    aspectRatio,
    outputFormat: "png",
    model: "flux-kontext-pro",
    enableTranslation: true,
    promptUpsampling: false,
    safetyTolerance: 2,
  });
  if (resp.code !== 200) {
    throw new Error(`Error de la API: ${resp.msg ?? "desconocido"}`);
  }
  return resp.data.taskId;
}

async function enviarTrabajoGptImage({ prompt, aspectRatio }) {
  const resp = await llamarApi("POST", "/jobs/createTask", {
    model: GPT_IMAGE_MODEL,
    input: {
      prompt,
      aspect_ratio: aspectRatio,
      resolution: "1K",
    },
  });
  if (resp.code !== 200) {
    throw new Error(`Error de la API: ${resp.msg ?? "desconocido"}`);
  }
  return resp.data.taskId;
}

async function enviarTrabajo(item) {
  return item.engine === "flux" ? enviarTrabajoFlux(item) : enviarTrabajoGptImage(item);
}

async function esperarResultado(taskId, { maxEsperaMs = 180_000, intervaloMs = 5_000 } = {}) {
  const inicio = Date.now();
  while (Date.now() - inicio < maxEsperaMs) {
    await new Promise((r) => setTimeout(r, intervaloMs));
    const resp = await llamarApi("GET", `/jobs/recordInfo?taskId=${taskId}`);
    if (resp.code !== 200) continue;

    const estado = (resp.data?.state ?? "").toLowerCase();
    if (["success", "completed", "finish", "finished"].includes(estado)) {
      let resultado = resp.data.resultJson;
      if (typeof resultado === "string") resultado = JSON.parse(resultado);
      return resultado;
    }
    if (["failed", "error", "fail"].includes(estado)) {
      throw new Error(`Generación falló: ${resp.data?.failMsg ?? "sin detalle"}`);
    }
    process.stdout.write(".");
  }
  throw new Error(`Se agotó el tiempo de espera (${maxEsperaMs / 1000}s) para ${taskId}`);
}

function extraerUrlImagen(resultado) {
  if (Array.isArray(resultado) && resultado.length) {
    const item = resultado[0];
    for (const key of ["url", "imageUrl", "image_url", "output", "uri"]) {
      if (item?.[key]) return item[key];
    }
  }
  if (resultado && typeof resultado === "object") {
    for (const key of ["resultUrls", "url", "imageUrl", "image_url", "output", "uri", "images"]) {
      const val = resultado[key];
      if (Array.isArray(val)) return typeof val[0] === "string" ? val[0] : val[0]?.url;
      if (val) return val;
    }
  }
  const texto = JSON.stringify(resultado);
  const match = texto.match(/https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)/);
  return match ? match[0] : null;
}

async function descargarImagen(url, rutaDestino) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`No se pudo descargar ${url}: HTTP ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  writeFileSync(rutaDestino, buffer);
}

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  const argSolo = process.argv.find((a) => a.startsWith("--only"));
  const soloClaves = argSolo
    ? (argSolo.split("=")[1] ?? process.argv[process.argv.indexOf(argSolo) + 1])?.split(",")
    : null;

  mkdirSync(OUTDIR, { recursive: true });

  const porGenerar = soloClaves
    ? PROMPTS.filter((p) => soloClaves.includes(p.key))
    : PROMPTS;

  if (!porGenerar.length) {
    console.error("❌ Nada que generar — revisa --only");
    process.exit(1);
  }

  console.log(`Generando ${porGenerar.length} imagen(es) en ${OUTDIR}\n`);

  for (const item of porGenerar) {
    console.log(`→ ${item.key} (${item.engine} · ${item.aspectRatio})`);
    try {
      const taskId = await enviarTrabajo(item);
      process.stdout.write(`  tarea ${taskId} `);
      const resultado = await esperarResultado(taskId);
      const url = extraerUrlImagen(resultado);
      if (!url) throw new Error(`No se encontró URL de imagen en: ${JSON.stringify(resultado)}`);
      const destino = join(OUTDIR, item.archivo);
      await descargarImagen(url, destino);
      console.log(`\n  ✅ guardada en public/images/marketing/${item.archivo}`);
    } catch (err) {
      console.error(`\n  ❌ ${item.key} falló: ${err.message}`);
    }
  }

  console.log("\nListo. Referenciar las imágenes en el código como /images/marketing/<archivo>.");
}

main();
