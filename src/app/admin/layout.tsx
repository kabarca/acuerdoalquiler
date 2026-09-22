import Link from "next/link";
import { getAdminActual } from "@/lib/auth";
import { cerrarSesion } from "@/app/dashboard/actions";
import { IconGrid, IconBuilding, IconUsers, IconAlert } from "@/lib/icons";

const NAV = [
  { href: "/admin", label: "Panel", icon: IconGrid },
  { href: "/admin/arrendadores", label: "Arrendadores", icon: IconUsers },
  { href: "/admin/propiedades", label: "Propiedades", icon: IconBuilding },
  { href: "/admin/inquilinos", label: "Inquilinos", icon: IconUsers },
  { href: "/admin/morosos", label: "Morosos", icon: IconAlert },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminActual();

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4.5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary-dark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
          </div>
          <span className="font-heading text-[15px] font-bold">Rentia</span>
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary uppercase">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="font-semibold text-ink-soft hover:text-ink">
            Volver al panel
          </Link>
          <span className="text-border">·</span>
          <span className="text-ink-faint">{admin.email}</span>
          <form action={cerrarSesion}>
            <button type="submit" className="font-semibold text-ink-soft hover:text-ink">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <nav className="flex items-center gap-1.5 overflow-x-auto border-b border-border bg-surface px-8 py-2.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex shrink-0 items-center gap-2 rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold text-ink-soft hover:bg-bg hover:text-ink"
          >
            <item.icon />
            {item.label}
          </Link>
        ))}
      </nav>

      <main>{children}</main>
    </div>
  );
}
