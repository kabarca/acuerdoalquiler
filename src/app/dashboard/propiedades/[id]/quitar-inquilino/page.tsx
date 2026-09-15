import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { quitarInquilino } from "../../../actions";

const MOTIVOS = [
  "Fin de contrato o mudanza planeada",
  "Inconformidad con la propiedad",
  "Cambio en la situación económica del inquilino",
  "Conflicto con el arrendador",
  "Otro",
];

export default async function QuitarInquilinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const arrendador = await getArrendadorActual();
  const { id } = await params;

  const propiedad = await prisma.propiedad.findFirst({
    where: { id, arrendadorId: arrendador.id },
    include: { inquilinos: { where: { activo: true } } },
  });

  const inquilino = propiedad?.inquilinos[0];

  if (!propiedad || !inquilino) {
    notFound();
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-[560px] rounded-[18px] border border-border bg-surface p-8 shadow-[0_20px_40px_-24px_rgba(16,24,38,0.16)]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[19px] font-semibold">Antes de continuar, cuéntenos por qué</h1>
          <p className="text-[13.5px] leading-relaxed text-ink-soft">
            <strong>{inquilino.nombre}</strong> dejará de ser inquilino de{" "}
            <strong>{propiedad.direccion}</strong>. Su respuesta nos ayuda a mejorar Rentia.
          </p>
        </div>

        <form action={quitarInquilino} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="inquilinoId" value={inquilino.id} />
          <input type="hidden" name="propiedadId" value={propiedad.id} />

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-ink-soft">
              ¿Cuál fue el motivo principal?
            </label>
            {MOTIVOS.map((motivo, i) => (
              <label
                key={motivo}
                className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-light"
              >
                <input
                  type="radio"
                  name="motivoSalida"
                  value={motivo}
                  defaultChecked={i === 0}
                  className="h-[18px] w-[18px] accent-primary"
                />
                {motivo}
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Cuéntenos más (opcional)</label>
            <textarea
              name="notaSalida"
              rows={3}
              placeholder="Ej. Encontró un local más cerca de su negocio."
              className="w-full resize-none rounded-[10px] border-[1.5px] border-border px-3.5 py-3 text-[14.5px] outline-none focus:border-primary"
            />
          </div>

          <p className="text-xs leading-relaxed text-ink-faint">
            Esta información no se comparte con {inquilino.nombre.split(" ")[0]} ni afecta su
            reputación en Rentia.
          </p>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/propiedades/${propiedad.id}`}
              className="flex-1 rounded-[10px] border-[1.5px] border-border py-3 text-center text-[14.5px] font-semibold text-ink-soft"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-[1.4] rounded-[10px] bg-primary py-3 text-[14.5px] font-bold text-white hover:bg-primary-dark"
            >
              Confirmar salida del inquilino
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
