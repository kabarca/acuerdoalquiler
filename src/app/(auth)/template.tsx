// Igual que dashboard/template.tsx: se remonta en cada navegación dentro de
// este grupo (/login ↔ /registro), así que la tarjeta entra con una
// transición corta en vez de aparecer de golpe.
export default function AuthTemplate({
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
