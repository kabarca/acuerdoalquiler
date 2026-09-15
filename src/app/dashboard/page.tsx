import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArrendadorActual } from "@/lib/auth";
import { crearPropiedad } from "./actions";

const inputClass =
  "rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default async function PropiedadesPage() {
  const arrendador = await getArrendadorActual();

  const propiedades = await prisma.propiedad.findMany({
    where: { arrendadorId: arrendador.id },
    include: { inquilinos: true },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Propiedades</h1>
          <p className="mt-1 text-sm text-muted">
            {propiedades.length}{" "}
            {propiedades.length === 1 ? "propiedad registrada" : "propiedades registradas"}
          </p>
        </div>
      </div>

      <details className="group mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <summary className="cursor-pointer text-sm font-medium text-primary">
          + Agregar propiedad
        </summary>
        <form action={crearPropiedad} className="mt-4 flex gap-2">
          <input
            name="direccion"
            placeholder="Dirección de la propiedad"
            required
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
          >
            Agregar
          </button>
        </form>
      </details>

      <div className="mt-6 flex flex-col gap-3">
        {propiedades.length === 0 && (
          <p className="text-sm text-muted">
            Todavía no tienes propiedades registradas.
          </p>
        )}

        {propiedades.map((propiedad) => {
          const inquilino = propiedad.inquilinos[0];
          return (
            <Link
              key={propiedad.id}
              href={`/dashboard/propiedades/${propiedad.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-primary/40"
            >
              <div>
                <p className="font-medium">{propiedad.direccion}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {inquilino ? inquilino.nombre : "Sin inquilino"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  inquilino
                    ? "bg-blue-50 text-primary"
                    : "bg-slate-100 text-muted"
                }`}
              >
                {inquilino ? "Ocupada" : "Vacante"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
