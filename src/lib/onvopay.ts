// Cliente de Onvopay (procesador de pagos con tarjeta en Costa Rica).
//
// PENDIENTE: Thomas todavía no tiene cuenta creada en https://onvopay.com.
// Mientras no existan ONVOPAY_SECRET_KEY / ONVOPAY_PUBLISHABLE_KEY, estas
// funciones no se pueden usar contra la API real — hay que crear la cuenta
// primero (modo de pruebas) y revisar docs.onvopay.com para confirmar los
// endpoints exactos de "payment links" antes de conectar esto de verdad.

const ONVOPAY_API_BASE = "https://api.onvopay.com/v1";

function getSecretKey() {
  const key = process.env.ONVOPAY_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Falta ONVOPAY_SECRET_KEY — todavía no hay cuenta de Onvopay configurada.",
    );
  }
  return key;
}

export async function crearLinkDePago(params: {
  montoEnColones: number;
  descripcion: string;
  referenciaFacturaId: string;
}) {
  const res = await fetch(`${ONVOPAY_API_BASE}/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.montoEnColones,
      currency: "CRC",
      description: params.descripcion,
      metadata: { facturaId: params.referenciaFacturaId },
    }),
  });

  if (!res.ok) {
    throw new Error(`Onvopay respondió ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<{ id: string; url: string }>;
}
