// Next.js remonta este componente en cada navegación dentro de /dashboard
// (a diferencia de layout.tsx, que persiste) — así cada cambio de sección
// del menú vuelve a correr la animación de entrada.
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-[rt-page-in_340ms_cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:animate-none">
      {children}
    </div>
  );
}
