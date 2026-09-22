import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verificarArrendadorManualmente } from "../../actions";

const TIPO_DOCUMENTO_LABEL: Record<string, string> = {
  CEDULA: "Cédula",
  PASAPORTE: "Pasaporte",
};

export default async function AdminArrendadorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const arrendador = await prisma.arrendador.findUnique({
    where: { id },
    include: { _count: { select: { propiedades: true } } },
  });

  if (!arrendador) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5.5 px-8 py-9">
      <Link href="/admin/arrendadores" className="text-[13.5px] font-semibold text-accent">
        ← Volver a Arrendadores
      </Link>

      <div>
        <h1 className="text-[23px] font-semibold">{arrendador.nombre}</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          {arrendador.email} · {arrendador._count.propiedades}{" "}
          {arrendador._count.propiedades === 1 ? "propiedad" : "propiedades"}
        </p>
      </div>

      {arrendador.identidadVerificada ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-success bg-success-bg p-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
          <div>
            <p className="text-[14.5px] font-bold text-success">Identidad verificada</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {arrendador.identidadVerificadaEn?.toLocaleDateString("es-CR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      ) : !arrendador.documentoFotoBytes ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-ink-soft">
          Todavía no ha enviado su verificación de identidad.
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl border border-warning bg-warning-bg p-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
          <p className="text-[14.5px] font-bold text-warning">
            El sistema no confirmó automáticamente que las fotos coinciden — revíselas usted mismo.
          </p>
        </div>
      )}

      {arrendador.documentoFotoBytes && (
        <>
          <div className="flex flex-wrap gap-3 text-[13.5px]">
            <span className="rounded-full bg-bg px-3 py-1.5 font-semibold text-ink-soft">
              {arrendador.tipoDocumentoIdentidad ? TIPO_DOCUMENTO_LABEL[arrendador.tipoDocumentoIdentidad] : "Documento"}
              {arrendador.numeroDocumentoIdentidad ? ` · ${arrendador.numeroDocumentoIdentidad}` : ""}
            </span>
            {arrendador.rostrosCoinciden !== null && (
              <span
                className={`rounded-full px-3 py-1.5 font-semibold ${
                  arrendador.rostrosCoinciden ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                }`}
              >
                {arrendador.rostrosCoinciden ? "El navegador detectó coincidencia" : "El navegador no detectó coincidencia"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-ink-faint">Foto de documento</span>
              <img
                src={`/foto-verificacion-arrendador/${arrendador.id}/documento`}
                alt="Documento del arrendador"
                className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-ink-faint">Selfie</span>
              <img
                src={`/foto-verificacion-arrendador/${arrendador.id}/selfie`}
                alt="Selfie del arrendador"
                className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
              />
            </div>
          </div>

          {arrendador.textoExtraidoDocumento && (
            <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5">
              <span className="text-[13px] font-semibold text-ink-faint">Texto leído en el documento</span>
              <p className="whitespace-pre-wrap text-[13.5px] text-ink-soft">
                {arrendador.textoExtraidoDocumento}
              </p>
            </div>
          )}

          {!arrendador.identidadVerificada && (
            <form action={verificarArrendadorManualmente}>
              <input type="hidden" name="arrendadorId" value={arrendador.id} />
              <button
                type="submit"
                className="w-full rounded-[10px] bg-primary py-3.5 text-[14.5px] font-bold text-white hover:bg-primary-dark"
              >
                Aprobar verificación manualmente
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
