export default function AdminTemplate({
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
