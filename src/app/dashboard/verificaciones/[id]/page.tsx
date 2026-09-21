import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";

export default async function VerificacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;

  const verificacion = await prisma.verificacionIdentidad.findFirst({
    where: { id, inquilino: { propiedad: { arrendadorId: arrendador.id } } },
    include: { inquilino: { include: { propiedad: true } } },
  });

  if (!verificacion) {
    notFound();
  }

  const { inquilino } = verificacion;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5.5 px-8 py-9">
      <Link
        href={`/dashboard/propiedades/${inquilino.propiedadId}`}
        className="text-[13.5px] font-semibold text-accent"
      >
        ← Volver a {inquilino.propiedad.direccion}
      </Link>

      <div>
        <h1 className="text-[23px] font-semibold">Verificación de identidad</h1>
        <p className="mt-0.5 text-sm text-ink-soft">{inquilino.nombre}</p>
      </div>

      {verificacion.estado !== "COMPLETADA" ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-ink-soft">
          {inquilino.nombre} todavía no ha completado la verificación.
        </div>
      ) : (
        <>
          <div
            className={`flex items-center gap-2.5 rounded-2xl border p-5 ${
              verificacion.rostrosCoinciden
                ? "border-success bg-success-bg"
                : "border-danger bg-danger-bg"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={verificacion.rostrosCoinciden ? "text-success" : "text-danger"}>
              {verificacion.rostrosCoinciden ? (
                <path d="M5 12.5l4.5 4.5 9.5-10" />
              ) : (
                <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>
              )}
            </svg>
            <div>
              <p className={`text-[14.5px] font-bold ${verificacion.rostrosCoinciden ? "text-success" : "text-danger"}`}>
                {verificacion.rostrosCoinciden
                  ? "El sistema detectó que los rostros coinciden"
                  : "El sistema no detectó una coincidencia clara"}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Comparación calculada en el celular del inquilino al momento de subir las fotos. Revise
                las fotos usted mismo para confirmar — no es una prueba definitiva.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-ink-faint">Foto de cédula</span>
              <img
                src={`/foto-verificacion/${verificacion.id}/cedula`}
                alt="Foto de cédula del inquilino"
                className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-ink-faint">Selfie</span>
              <img
                src={`/foto-verificacion/${verificacion.id}/selfie`}
                alt="Selfie del inquilino"
                className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
              />
            </div>
          </div>

          {verificacion.textoExtraidoCedula && (
            <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5">
              <span className="text-[13px] font-semibold text-ink-faint">Texto leído en la cédula</span>
              <p className="whitespace-pre-wrap text-[13.5px] text-ink-soft">
                {verificacion.textoExtraidoCedula}
              </p>
            </div>
          )}

          <p className="text-xs text-ink-faint">
            Completada el{" "}
            {verificacion.completadoEn?.toLocaleDateString("es-CR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </>
      )}
    </div>
  );
}
