// Se remonta cada vez que se entra a la landing (p. ej. al hacer clic en el
// logo desde login/registro/panel), así que también tiene su transición de
// entrada en vez de aparecer de golpe.
export default function MarketingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-[rt-page-in_420ms_cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:animate-none">
      {children}
    </div>
  );
}
