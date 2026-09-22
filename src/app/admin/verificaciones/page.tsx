import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verificarArrendadorManualmente } from "../actions";

const TIPO_DOCUMENTO_LABEL: Record<string, string> = {
  CEDULA: "Cédula",
  PASAPORTE: "Pasaporte",
};

export default async function AdminVerificacionesPage() {
  const pendientes = await prisma.arrendador.findMany({
    where: { identidadVerificada: false, documentoFotoBytes: { not: null } },
    orderBy: { creadoEn: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <Link href="/admin" className="text-[13.5px] font-semibold text-accent">
        ← Volver al panel
      </Link>

      <div className="mt-3 flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold">Verificaciones pendientes</h1>
        <p className="text-[14.5px] text-ink-soft">
          Arrendadores cuyo match de rostros no se confirmó automáticamente — revise las fotos y
          apruebe o deje pendiente. {pendientes.length}{" "}
          {pendientes.length === 1 ? "caso" : "casos"} en total.
        </p>
      </div>

      {pendientes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center text-sm text-ink-soft">
          No hay verificaciones pendientes de revisión.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {pendientes.map((a) => (
            <div key={a.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold">{a.nombre}</p>
                  <p className="text-[12.5px] text-ink-faint">
                    {a.email}
                    {a.tipoDocumentoIdentidad ? ` · ${TIPO_DOCUMENTO_LABEL[a.tipoDocumentoIdentidad]}` : ""}
                    {a.numeroDocumentoIdentidad ? ` ${a.numeroDocumentoIdentidad}` : ""}
                  </p>
                </div>
                <Link href={`/admin/arrendadores/${a.id}`} className="text-xs font-semibold text-accent">
                  Ver detalle →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <img
                  src={`/foto-verificacion-arrendador/${a.id}/documento`}
                  alt={`Documento de ${a.nombre}`}
                  className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
                />
                <img
                  src={`/foto-verificacion-arrendador/${a.id}/selfie`}
                  alt={`Selfie de ${a.nombre}`}
                  className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
                />
              </div>

              <form action={verificarArrendadorManualmente}>
                <input type="hidden" name="arrendadorId" value={a.id} />
                <button
                  type="submit"
                  className="w-full rounded-[10px] bg-primary py-3 text-[14px] font-bold text-white hover:bg-primary-dark"
                >
                  Aprobar verificación
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
