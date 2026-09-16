import Link from "next/link";
import { getArrendadorActual } from "@/lib/auth";
import { cerrarSesion } from "./actions";
import { IconGrid, IconBuilding, IconUsers, IconCard, IconGear, IconHelp, IconShield } from "@/lib/icons";

const NAV = [
  { href: "/dashboard", label: "Panel", icon: IconGrid },
  { href: "/dashboard/propiedades", label: "Propiedades", icon: IconBuilding },
  { href: "/dashboard/inquilinos", label: "Inquilinos", icon: IconUsers },
  { href: "/dashboard/pagos", label: "Pagos", icon: IconCard },
  { href: "/dashboard/configuracion", label: "Configuración", icon: IconGear },
  { href: "/dashboard/ayuda", label: "Ayuda", icon: IconHelp },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const arrendador = await getArrendadorActual();

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-[240px] shrink-0 flex-col gap-7 bg-primary-dark px-4.5 py-7">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white/15">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
          </div>
          <span className="font-heading text-[17px] font-bold text-white">Rentia</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14.5px] font-semibold text-[#c7d3e3] hover:bg-white/10 hover:text-white"
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>

        {arrendador.esAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-[10px] border border-white/10 px-3.5 py-2.5 text-[13.5px] font-semibold text-[#c7d3e3] hover:bg-white/10 hover:text-white"
          >
            <IconShield />
            Panel admin
          </Link>
        )}

        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 px-2 pt-4">
          <p className="truncate text-sm font-semibold text-white">{arrendador.nombre}</p>
          <p className="truncate text-xs text-[#93a3bc]">{arrendador.email}</p>
          <form action={cerrarSesion}>
            <button type="submit" className="text-left text-xs font-semibold text-[#93a3bc] hover:text-white">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
