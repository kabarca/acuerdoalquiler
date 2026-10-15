// Borrador de propiedad que un visitante anónimo arma en /comenzar/propiedad
// antes de crear cuenta. Vive solo en sessionStorage del navegador — nunca
// toca el servidor hasta que, ya autenticado, se envía junto con los datos
// del inquilino en /dashboard/propiedades/nueva (crearPropiedadConInquilino).
//
// Limitación aceptada: si el visitante cierra la pestaña o abre el registro
// en una pestaña nueva, el borrador se pierde — no hay respaldo del lado del
// servidor para esto (ver CLAUDE.md, flujo de inicio rápido).

import { useSyncExternalStore } from "react";

export type DraftPropiedad = {
  direccion?: string;
  tipo?: "APARTAMENTO" | "CASA" | "LOCAL_COMERCIAL";
  provincia?: string;
  canton?: string;
  distrito?: string;
  montoRenta?: string;
  diaCobro?: string;
};

const CLAVE = "acuerdoalquiler:draft-propiedad";

// useSyncExternalStore exige que getSnapshot() devuelva la MISMA referencia
// mientras el dato no cambie (si no, React lo interpreta como "cambia en
// cada render" y tira "getSnapshot should be cached to avoid an infinite
// loop"). JSON.parse crea un objeto nuevo cada vez, así que se cachea contra
// el string crudo de sessionStorage.
let crudoCacheado: string | null = null;
let draftCacheado: DraftPropiedad | null = null;

export function leerDraft(): DraftPropiedad | null {
  if (typeof window === "undefined") return null;
  let crudo: string | null;
  try {
    crudo = window.sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
  if (crudo === crudoCacheado) return draftCacheado;
  crudoCacheado = crudo;
  try {
    draftCacheado = crudo ? (JSON.parse(crudo) as DraftPropiedad) : null;
  } catch {
    draftCacheado = null;
  }
  return draftCacheado;
}

export function guardarDraft(parcial: DraftPropiedad) {
  if (typeof window === "undefined") return;
  try {
    const actual = leerDraft() ?? {};
    window.sessionStorage.setItem(CLAVE, JSON.stringify({ ...actual, ...parcial }));
  } catch {
    // sessionStorage no disponible (modo privado, cuota llena, etc.) — el
    // visitante simplemente tendrá que volver a escribir los datos.
  }
}

export function limpiarDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CLAVE);
  } catch {
    // no-op
  }
}

function sinSuscripcion() {
  // sessionStorage no dispara eventos "storage" en la misma pestaña que
  // escribe — no hay nada que suscribir, solo una lectura inicial segura
  // para SSR vía useSyncExternalStore (evita el anti-patrón de setState
  // dentro de un useEffect en el montaje).
  return () => {};
}

/** Lee el draft de forma segura para SSR — null en el server, el valor real
 * de sessionStorage en el cliente, sin parpadeo ni setState-en-efecto. */
export function useDraftPropiedad(): DraftPropiedad | null {
  return useSyncExternalStore(sinSuscripcion, leerDraft, () => null);
}
