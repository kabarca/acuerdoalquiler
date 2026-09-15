// Se muestra al instante en cuanto se hace clic en el menú, mientras el
// servidor resuelve la página nueva (consulta a la base de datos). Sin esto,
// el clic se queda "congelado" un rato y el contenido aparece de golpe —
// con esto hay reacción inmediata, como una transición real.
function Bloque({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border/70 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="px-8 py-9">
      <div className="flex flex-col gap-1.5">
        <Bloque className="h-7 w-56" />
        <Bloque className="h-4 w-80" />
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
            <Bloque className="h-3.5 w-28" />
            <Bloque className="h-7 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <Bloque className="mb-5 h-5 w-44" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <Bloque className="h-4 w-24" />
              <Bloque className="h-4 w-32" />
              <Bloque className="h-4 flex-1" />
              <Bloque className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
