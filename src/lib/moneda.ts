// Monedas en que se puede cobrar un alquiler. Cada inquilino tiene una
// (Inquilino.moneda) y sus facturas la heredan (Factura.moneda).
export type Moneda = "CRC" | "USD";

export const MONEDAS: { valor: Moneda; nombre: string; simbolo: string }[] = [
  { valor: "CRC", nombre: "Colones", simbolo: "₡" },
  { valor: "USD", nombre: "Dólares", simbolo: "US$" },
];

export function simboloDe(moneda: Moneda): string {
  return moneda === "USD" ? "US$" : "₡";
}

// "₡550 000" o "US$1 200,50" (separadores de es-CR) — los colones sin
// decimales salvo que existan, los dólares siempre con dos.
export function formatearMonto(valor: number | string | { toString(): string }, moneda: Moneda): string {
  const numero = Number(valor.toString());
  const texto = numero.toLocaleString("es-CR", {
    minimumFractionDigits: moneda === "USD" ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${simboloDe(moneda)}${texto}`;
}

export function monedaDe(valor: unknown): Moneda {
  return valor === "USD" ? "USD" : "CRC";
}

// Suma montos de varias monedas por separado (nunca se mezclan colones y
// dólares) y devuelve el texto listo para mostrar, p. ej. "₡1 100 000 + US$800,00".
export function sumarPorMoneda(filas: { monto: number | string | { toString(): string }; moneda: Moneda }[]): string {
  const totales: Record<Moneda, number> = { CRC: 0, USD: 0 };
  for (const f of filas) totales[f.moneda] += Number(f.monto.toString());
  const partes = (["CRC", "USD"] as Moneda[])
    .filter((m) => totales[m] > 0)
    .map((m) => formatearMonto(totales[m], m));
  return partes.length ? partes.join(" + ") : formatearMonto(0, "CRC");
}
