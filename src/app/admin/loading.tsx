function Bloque({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border/70 ${className}`} />;
}

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex flex-col gap-1.5">
        <Bloque className="h-7 w-64" />
        <Bloque className="h-4 w-80" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
            <Bloque className="h-10 w-10 rounded-[10px]" />
            <Bloque className="h-3.5 w-24" />
            <Bloque className="h-9 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
