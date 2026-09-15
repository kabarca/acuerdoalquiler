import Link from "next/link";
import { getArrendadorActual } from "@/lib/auth";
import { cerrarSesion } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const arrendador = await getArrendadorActual();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="px-5 py-5">
          <span className="text-lg font-semibold tracking-tight">RentaCR</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-background"
          >
            Propiedades
          </Link>
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="truncate text-sm font-medium">{arrendador.nombre}</p>
          <p className="truncate text-xs text-muted">{arrendador.email}</p>
          <form action={cerrarSesion} className="mt-2">
            <button
              type="submit"
              className="text-xs font-medium text-muted hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
