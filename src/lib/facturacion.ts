import { prisma } from "@/lib/prisma";
import { enviarFactura, intentarEnvio } from "@/lib/resend";

const ZONA = "America/Costa_Rica";

// "Hoy" según Costa Rica (UTC-6, sin horario de verano) — el servidor corre
// en UTC, así que sin esto el día cambiaría 6 horas antes de lo esperado.
export function hoyCostaRica(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ahora);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)!.value);
  return { anio: valor("year"), mes: valor("month"), dia: valor("day") };
}

export function periodoDe(anio: number, mes: number) {
  return `${anio}-${String(mes).padStart(2, "0")}`;
}

// Fecha máxima de pago: el próximo `diaLimite` a partir del día de envío. Si
// el límite es antes del día de envío (p. ej. se envía el 25 y vence el 5),
// cae en el mes siguiente. Se guarda a las 12:00 UTC para que se vea el mismo
// día tanto en Costa Rica como en el servidor.
export function calcularFechaVencimiento(anio: number, mes: number, diaEnvio: number, diaLimite: number) {
  const mesVencimiento = diaLimite >= diaEnvio ? mes : mes + 1;
  return new Date(Date.UTC(anio, mesVencimiento - 1, diaLimite, 12));
}

export function formatearFecha(fecha: Date) {
  return fecha.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  });
}

export function enteroDia(valor: FormDataEntryValue | null, porDefecto: number) {
  if (valor === null || valor === "") return porDefecto;
  const n = Number(valor);
  if (!Number.isInteger(n)) return porDefecto;
  return Math.min(28, Math.max(1, n));
}

export type ResultadoFacturacion = {
  fecha: string;
  generadas: number;
  enviadas: number;
  // No salieron por correo; el arrendador las ve como aviso en su panel.
  noEnviadas: number;
};

const TAMANO_LOTE = 10;

// Corre una vez al día (ver app/api/cron/facturas). Es idempotente: si se
// ejecuta dos veces el mismo día, o se salta un día, no duplica ni pierde
// facturas — por eso compara con ">=" y no con "==". Los inquilinos se
// procesan de 10 en 10 en paralelo para que el cron termine rápido aunque
// haya muchos.
export async function procesarFacturacionAutomatica(ahora = new Date()): Promise<ResultadoFacturacion> {
  const { anio, mes, dia } = hoyCostaRica(ahora);
  const periodo = periodoDe(anio, mes);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inicioDeHoy = new Date(Date.UTC(anio, mes - 1, dia, 6));
  const resultado: ResultadoFacturacion = {
    fecha: `${periodo}-${String(dia).padStart(2, "0")}`,
    generadas: 0,
    enviadas: 0,
    noEnviadas: 0,
  };

  const inquilinos = await prisma.inquilino.findMany({
    where: { activo: true },
    include: { propiedad: true, facturas: { where: { periodo } } },
  });

  type InquilinoConDatos = (typeof inquilinos)[number];

  async function procesar(inquilino: InquilinoConDatos) {
    if (inquilino.fechaInicioContrato && inquilino.fechaInicioContrato > ahora) return;
    if (inquilino.fechaFinContrato && inquilino.fechaFinContrato < inicioDeHoy) return;

    let factura = inquilino.facturas[0];

    // Un inquilino registrado después de su día de generación de este mes
    // empieza a facturarse el mes siguiente (el arrendador puede crear la de
    // este mes a mano desde la propiedad si la quiere ya).
    const finDelDiaDeGeneracion = new Date(Date.UTC(anio, mes - 1, inquilino.diaGeneracion + 1, 6));

    if (!factura && dia >= inquilino.diaGeneracion && inquilino.creadoEn < finDelDiaDeGeneracion) {
      factura = await prisma.factura.upsert({
        where: { inquilinoId_periodo: { inquilinoId: inquilino.id, periodo } },
        update: {},
        create: {
          inquilinoId: inquilino.id,
          periodo,
          monto: inquilino.montoRenta,
          fechaVencimiento: calcularFechaVencimiento(anio, mes, inquilino.diaEnvio, inquilino.diaCobro),
        },
      });
      resultado.generadas++;
    }

    if (!factura || factura.estado !== "PENDIENTE" || factura.facturaEnviadaEn) return;
    if (dia < Math.max(inquilino.diaEnvio, inquilino.diaGeneracion)) return;

    const envio = await intentarEnvio(() =>
      enviarFactura({
        paraEmail: inquilino.email,
        nombreInquilino: inquilino.nombre,
        direccionPropiedad: inquilino.propiedad.direccion,
        monto: Number(factura.monto).toLocaleString("es-CR"),
        fechaVencimiento: formatearFecha(factura.fechaVencimiento),
        periodo,
        linkPago: `${baseUrl}/pagar/${factura.id}`,
      }),
    );

    if (envio.ok) {
      await prisma.factura.update({
        where: { id: factura.id },
        data: { facturaEnviadaEn: new Date(), errorEnvio: null },
      });
      resultado.enviadas++;
    } else {
      if (factura.errorEnvio !== envio.error) {
        await prisma.factura.update({ where: { id: factura.id }, data: { errorEnvio: envio.error } });
      }
      resultado.noEnviadas++;
    }
  }

  for (let i = 0; i < inquilinos.length; i += TAMANO_LOTE) {
    await Promise.all(inquilinos.slice(i, i + TAMANO_LOTE).map(procesar));
  }

  return resultado;
}
