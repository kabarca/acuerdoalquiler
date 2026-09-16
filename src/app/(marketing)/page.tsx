import Link from "next/link";

const PASOS = [
  {
    numero: "PASO 1",
    titulo: "Registre su propiedad e inquilino",
    texto: "Ingrese los datos de la propiedad, el inquilino y el monto mensual del arriendo.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><line x1="7.5" y1="7" x2="7.5" y2="7.1"/><line x1="12.5" y1="7" x2="12.5" y2="7.1"/><path d="M16 21v-6h4v6"/></svg>
    ),
  },
  {
    numero: "PASO 2",
    titulo: "Su inquilino recibe la factura",
    texto: "Recibe un correo con el detalle y un enlace para pagar por transferencia bancaria.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><line x1="2.5" y1="9.5" x2="21.5" y2="9.5"/><line x1="5.5" y1="14.5" x2="9.5" y2="14.5"/></svg>
    ),
  },
  {
    numero: "PASO 3",
    titulo: "Usted visualiza el estado y recibe alertas",
    texto: "Si el pago no se realiza a tiempo, se envía un recordatorio automático. Si la situación persiste, se le notifica a usted.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
    ),
  },
];

const FEATURES = [
  {
    titulo: "Transferencia bancaria",
    texto: "Su inquilino transfiere y sube el comprobante; usted lo confirma con un clic.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5l8-6 8 6"/><path d="M5.5 10.5v8M18.5 10.5v8"/><path d="M3 21h18"/><path d="M9 14.5v3M15 14.5v3"/></svg>
    ),
  },
  {
    titulo: "Recordatorios automáticos",
    texto: "Si el pago se atrasa, su inquilino recibe un recordatorio automático.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
    ),
  },
  {
    titulo: "Alertas si no pagan",
    texto: "Pasado el plazo, usted recibe una notificación para tomar acción oportunamente.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.5 20.5h19L12 4Z"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="12" y1="17.5" x2="12" y2="17.6"/></svg>
    ),
  },
  {
    titulo: "Panel simple",
    texto: "Todas sus propiedades, inquilinos y pagos en una sola vista clara.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg>
    ),
  },
];

const RESUMEN = [
  { propiedad: "Torres del Mar, Apto 8B, Santa Ana", detalle: "Camila Torres · vence 5 oct", estado: "Pagado", tono: "success" as const },
  { propiedad: "Plaza Real, Local 12, Curridabat", detalle: "Andrés Ruiz · vence 10 oct", estado: "Pendiente", tono: "warning" as const },
  { propiedad: "Barrio Dent, San José", detalle: "Laura Gómez · venció 28 sep", estado: "Vencido", tono: "danger" as const },
];

const TONOS = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-[9px] ${light ? "bg-white/15" : "bg-primary"}`}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
      </div>
      <span className="font-heading text-xl font-bold tracking-tight">Rentia</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-5 sm:px-16">
        <Logo />
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-ink-soft md:flex">
          <a href="#como-funciona" className="hover:text-ink">Cómo funciona</a>
          <a href="#precios" className="hover:text-ink">Precios</a>
          <a href="#para-arrendadores" className="hover:text-ink">Para arrendadores</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-[15px] font-semibold text-ink-soft hover:text-ink sm:block">
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-8 py-20 sm:px-16 lg:flex-row lg:py-24">
          <div className="flex flex-1 flex-col gap-7">
            <span className="w-fit rounded-full bg-primary-light px-3.5 py-2 text-[13px] font-semibold text-primary">
              Cobro de arriendo por transferencia, sin fricciones
            </span>
            <h1 className="text-[44px] leading-[1.08] font-bold tracking-tight sm:text-[56px]">
              Cobre el arriendo por transferencia, sin contratiempos.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-ink-soft">
              Rentia envía la factura a su inquilino, gestiona el cobro por transferencia
              bancaria, y le notifica automáticamente ante cualquier inconveniente. Usted se
              enfoca en sus propiedades.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/registro"
                className="flex items-center gap-2 rounded-[10px] bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                Crear cuenta gratis
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="19" y2="12"/><path d="M13 6l6 6-6 6"/></svg>
              </Link>
              <a href="#como-funciona" className="rounded-[10px] border-[1.5px] border-border px-6 py-3.5 text-[15px] font-semibold text-ink hover:bg-surface">
                Ver cómo funciona
              </a>
            </div>
            <div className="mt-1 flex gap-7 text-sm text-ink-faint">
              <span>Sin costo de configuración</span>
              <span>·</span>
              <span>Transferencia bancaria</span>
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-[440px] pb-16 sm:pb-20">
              <img
                src="https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=900&auto=format&fit=crop"
                alt="Edificio de apartamentos moderno"
                className="aspect-[4/3] w-full rounded-[20px] object-cover shadow-[0_30px_60px_-20px_rgba(16,24,38,0.28)]"
              />
              <div className="absolute right-4 bottom-0 left-4 overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_20px_45px_-16px_rgba(16,24,38,0.3)] sm:right-[-20px] sm:left-auto sm:w-[300px]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <span className="text-[14px] font-bold">Sus propiedades</span>
                  <span className="text-xs text-ink-faint">Octubre 2026</span>
                </div>
                <div className="flex flex-col">
                  {RESUMEN.map((r, i) => (
                    <div
                      key={r.propiedad}
                      className={`flex items-center justify-between px-5 py-3.5 ${i < RESUMEN.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <div>
                        <p className="text-[13.5px] font-semibold">{r.propiedad}</p>
                        <p className="mt-0.5 text-[12px] text-ink-faint">{r.detalle}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${TONOS[r.tono]}`}>
                        {r.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-8 py-22 sm:px-16">
            <div className="mb-14 flex flex-col items-center gap-3 text-center">
              <span className="text-[13px] font-bold tracking-wide text-primary uppercase">Cómo funciona</span>
              <h2 className="text-4xl font-bold tracking-tight">Tres pasos, cero seguimiento manual</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {PASOS.map((p) => (
                <div key={p.numero} className="flex flex-col gap-4 rounded-2xl border border-border bg-bg p-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                    {p.icono}
                  </div>
                  <span className="text-[13px] font-bold text-ink-faint">{p.numero}</span>
                  <h3 className="text-xl font-semibold">{p.titulo}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-soft">{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="para-arrendadores" className="mx-auto max-w-6xl px-8 py-22 sm:px-16">
          <h2 className="mb-14 text-center text-4xl font-bold tracking-tight">
            Todo lo que necesita para cobrar arriendo
          </h2>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1733244766159-f58f4184fd38?q=80&w=900&auto=format&fit=crop"
              alt="Entrega de llaves al inquilino de una propiedad en alquiler"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_20px_40px_-20px_rgba(16,24,38,0.2)]"
            />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.titulo} className="flex flex-col gap-3">
                  {f.icono}
                  <h3 className="text-base font-semibold">{f.titulo}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{f.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-8 py-22 sm:px-16">
            <div className="mb-14 flex flex-col items-center gap-3 text-center">
              <span className="text-[13px] font-bold tracking-wide text-primary uppercase">Precios</span>
              <h2 className="text-4xl font-bold tracking-tight">Simple, sin sorpresas</h2>
              <p className="max-w-lg text-[15px] leading-relaxed text-ink-soft">
                Usar Rentia no tiene costo.
              </p>
            </div>

            <div className="mx-auto flex max-w-sm flex-col gap-6 rounded-2xl border-2 border-primary bg-bg p-10 text-center">
              <span className="mx-auto w-fit rounded-full bg-primary-light px-3.5 py-1.5 text-[12.5px] font-bold text-primary">
                Gratis
              </span>
              <div>
                <span className="font-heading text-5xl font-bold">₡0</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-left text-[14.5px] text-ink-soft">
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                  Propiedades e inquilinos sin límite
                </li>
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                  Facturas, recordatorios y alertas
                </li>
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                  Sin costo de configuración
                </li>
              </ul>
              <Link
                href="/registro"
                className="rounded-[10px] bg-primary px-6 py-3 text-[15px] font-semibold text-white hover:bg-primary-dark"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto max-w-6xl px-8 pb-22 sm:px-16">
          <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl px-10 py-14 text-center sm:flex-row sm:text-left">
            <img
              src="https://images.unsplash.com/photo-1738852953898-ddebe3e8e80c?q=80&w=1400&auto=format&fit=crop"
              alt="Casa en alquiler"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/95 via-primary-dark/88 to-primary/75" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Comience a cobrar sin contratiempos
              </h2>
              <p className="mt-2 text-[16px] text-primary-light/90">
                Configure su primera propiedad en menos de 5 minutos.
              </p>
            </div>
            <Link
              href="/registro"
              className="relative shrink-0 rounded-[10px] bg-white px-6 py-3.5 text-[15px] font-semibold text-primary-dark"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-8 py-8 sm:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-heading text-base font-bold">Rentia</span>
          <span className="text-[13px] text-ink-faint">© 2026 Rentia</span>
        </div>
      </footer>
    </div>
  );
}
