import Link from "next/link";
import { InicioRapido } from "./inicio-rapido";

const PASOS = [
  {
    numero: "01",
    titulo: "Registre su propiedad e inquilino",
    texto: "Ingrese los datos de la propiedad, el inquilino y el monto mensual del arriendo.",
    imagen: "/images/marketing/paso-1-registro.png",
  },
  {
    numero: "02",
    titulo: "Su inquilino recibe la factura",
    texto: "Recibe un correo con el detalle y un enlace para pagar por transferencia bancaria.",
    imagen: "/images/marketing/paso-2-factura.png",
  },
  {
    numero: "03",
    titulo: "Usted visualiza el estado y recibe alertas",
    texto: "Si el pago no se realiza a tiempo, se envía un recordatorio automático. Si la situación persiste, se le notifica a usted.",
    imagen: "/images/marketing/paso-3-verificacion.png",
  },
];

const FEATURES = [
  {
    titulo: "Transferencia bancaria",
    texto: "Su inquilino transfiere y sube el comprobante; usted lo confirma con un clic.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-public-primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5l8-6 8 6"/><path d="M5.5 10.5v8M18.5 10.5v8"/><path d="M3 21h18"/><path d="M9 14.5v3M15 14.5v3"/></svg>
    ),
  },
  {
    titulo: "Recordatorios automáticos",
    texto: "Si el pago se atrasa, su inquilino recibe un recordatorio automático.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-public-primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
    ),
  },
  {
    titulo: "Alertas si no pagan",
    texto: "Pasado el plazo, usted recibe una notificación para tomar acción oportunamente.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-public-primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.5 20.5h19L12 4Z"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="12" y1="17.5" x2="12" y2="17.6"/></svg>
    ),
  },
  {
    titulo: "Panel simple",
    texto: "Todas sus propiedades, inquilinos y pagos en una sola vista clara.",
    icono: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-public-primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg>
    ),
  },
];

// Cifras de ejemplo — reemplazar por datos reales antes de publicar. Se
// marcan entre corchetes a propósito, tanto en el código como en pantalla,
// para que nunca se confundan con datos verdaderos.
const CIFRAS = [
  { valor: "[XX%]", etiqueta: "Pagos registrados a tiempo" },
  { valor: "[XXX]", etiqueta: "Inquilinos en el registro" },
  { valor: "[XX]", etiqueta: "Cantones cubiertos" },
];

// FAQ: copy real basado en el producto (no son cifras inventadas), redactado
// sin sobre-prometer — ver CLAUDE.md, sección Privacidad.
const PREGUNTAS = [
  {
    pregunta: "¿Cómo se registra un atraso en el historial de un inquilino?",
    respuesta:
      "El arrendador abre una disputa documentada desde su panel. El inquilino recibe aviso y puede responder antes de que el caso se marque como moroso — el registro siempre refleja ambas versiones.",
  },
  {
    pregunta: "¿El inquilino puede ver y disputar lo que se reporta de él?",
    respuesta:
      "Sí. Cuando se abre una disputa, el inquilino es notificado y puede dar su versión antes de que quede un resultado final en su historial.",
  },
  {
    pregunta: "¿Por qué el servicio es gratuito?",
    respuesta:
      "Porque el registro de morosidad solo sirve si cubre suficientes arrendadores e inquilinos. La prioridad ahora es esa cobertura, no los ingresos.",
  },
  {
    pregunta: "¿Qué métodos de pago acepta Acuerdo Alquiler?",
    respuesta:
      "Por ahora, solo transferencia bancaria: el inquilino transfiere y sube el comprobante, y el arrendador lo confirma.",
  },
  {
    pregunta: "¿Quién puede consultar el historial de un inquilino?",
    respuesta:
      "Solo arrendadores con cuenta en Acuerdo Alquiler, y únicamente de inquilinos que autorizaron compartir su historial al momento de registrarse.",
  },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-[3px] ${light ? "bg-white/10" : "bg-public-ink"}`}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 21v-6h4v6"/></svg>
      </div>
      <span className="text-xl font-semibold tracking-tight text-public-ink">Acuerdo Alquiler</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-public-bg">
      <header className="flex items-center justify-between border-b border-public-border bg-public-bg px-8 py-5 sm:px-16">
        <Logo />
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-public-muted md:flex">
          <a href="#como-funciona" className="hover:text-public-ink">Cómo funciona</a>
          <a href="#precios" className="hover:text-public-ink">Precios</a>
          <a href="#preguntas" className="hover:text-public-ink">Preguntas frecuentes</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-[15px] font-semibold text-public-muted hover:text-public-ink sm:block">
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-[3px] bg-public-primary px-5 py-2.5 text-[13px] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-public-ink"
          >
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-7 bg-public-ink px-8 py-20 sm:px-16 lg:py-28">
            <span className="text-[13px] font-semibold tracking-[0.12em] text-public-accent uppercase">
              Registro de pagos de alquiler en Costa Rica
            </span>
            <h1 className="max-w-lg text-[44px] leading-[1.12] font-light text-white sm:text-[52px]">
              Cobre el alquiler. <span className="text-public-accent">Quede registrado.</span>
            </h1>
            <p className="max-w-md text-[17px] leading-relaxed text-white/70">
              Acuerdo Alquiler factura a su inquilino, gestiona el cobro por transferencia bancaria
              y mantiene un registro verificable de cada pago y cada atraso.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/registro"
                className="rounded-[3px] bg-public-primary px-7 py-3.5 text-[13px] font-bold tracking-[0.15em] text-white uppercase transition-colors hover:bg-white hover:text-public-ink"
              >
                Crear cuenta gratis
              </Link>
              <a
                href="#como-funciona"
                className="rounded-[3px] border border-white/30 px-7 py-3.5 text-[13px] font-bold tracking-[0.15em] text-white uppercase hover:border-white"
              >
                Ver cómo funciona
              </a>
            </div>
            <div className="mt-1 flex gap-7 text-sm text-white/50">
              <span>Sin costo de configuración</span>
              <span>·</span>
              <span>Transferencia bancaria</span>
            </div>
          </div>
          <div className="min-h-[320px]">
            <img
              src="/images/marketing/hero-home.png"
              alt="Edificio residencial moderno en Costa Rica"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <InicioRapido />

        {/* Cómo funciona */}
        <section id="como-funciona" className="border-b border-public-border bg-public-bg">
          <div className="mx-auto max-w-6xl px-8 py-22 sm:px-16">
            <div className="mb-14 flex flex-col gap-3">
              <span className="text-[13px] font-semibold tracking-[0.12em] text-public-accent uppercase">Cómo funciona</span>
              <h2 className="text-4xl font-light text-public-ink">Tres pasos, cero seguimiento manual</h2>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden border border-public-border bg-public-border sm:grid-cols-3">
              {PASOS.map((p) => (
                <div key={p.numero} className="flex flex-col gap-4 bg-public-bg p-8">
                  <img
                    src={p.imagen}
                    alt=""
                    aria-hidden="true"
                    className="aspect-[4/3] w-full border border-public-border object-cover"
                  />
                  <span className="font-fira text-[13px] font-bold text-public-muted">{p.numero}</span>
                  <h3 className="text-xl font-medium text-public-ink">{p.titulo}</h3>
                  <p className="text-[15px] leading-relaxed text-public-body">{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bloque de cifras (placeholders — reemplazar antes de publicar) */}
        <section className="border-b border-public-border bg-public-ink">
          <div className="mx-auto max-w-6xl px-8 py-20 sm:px-16">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {CIFRAS.map((c) => (
                <div key={c.etiqueta} className="flex flex-col gap-2">
                  <div className="text-[64px] leading-none font-extrabold text-public-primary-light">{c.valor}</div>
                  <div className="text-[13px] font-semibold tracking-[0.08em] text-white/70 uppercase">{c.etiqueta}</div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[13px] text-white/40 italic">
              Cifras de ejemplo — se reemplazan por datos reales antes de publicar el sitio.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-8 py-22 sm:px-16">
          <h2 className="mb-14 text-4xl font-light text-public-ink">
            Todo lo que necesita para cobrar arriendo
          </h2>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.titulo} className="flex flex-col gap-3">
                  {f.icono}
                  <h3 className="text-base font-semibold text-public-ink">{f.titulo}</h3>
                  <p className="text-sm leading-relaxed text-public-body">{f.texto}</p>
                </div>
              ))}
            </div>
            <div className="border border-public-border bg-public-surface p-10">
              <p className="text-[13px] font-semibold tracking-[0.1em] text-public-accent uppercase">Para arrendadores</p>
              <p className="mt-3 text-lg leading-relaxed text-public-body">
                Un panel para ver cada propiedad, cada inquilino y cada pago — sin hojas de cálculo
                sueltas ni seguimiento manual por WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* Cita institucional (placeholder — reemplazar por testimonio real) */}
        <section className="relative overflow-hidden border-y border-public-border bg-public-surface">
          <img
            src="/images/marketing/cita-institucional-fondo.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.08]"
          />
          <div className="relative mx-auto flex max-w-3xl gap-6 px-8 py-20 sm:px-16">
            <div className="w-[3px] shrink-0 bg-public-primary-light" />
            <div className="flex flex-col gap-5">
              <p className="font-fira text-2xl leading-snug font-light text-public-ink italic">
                &ldquo;[Cita de ejemplo — reemplazar con un testimonio real de un arrendador que ya
                usa Acuerdo Alquiler.]&rdquo;
              </p>
              <div>
                <p className="text-[15px] font-semibold text-public-ink">[Nombre del arrendador]</p>
                <p className="text-sm text-public-muted">[Cargo o relación con la propiedad]</p>
              </div>
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className="bg-public-bg">
          <div className="mx-auto max-w-6xl px-8 py-22 sm:px-16">
            <div className="mb-14 flex flex-col gap-3">
              <span className="text-[13px] font-semibold tracking-[0.12em] text-public-accent uppercase">Precios</span>
              <h2 className="text-4xl font-light text-public-ink">Sin costo por ahora</h2>
              <p className="max-w-lg text-[15px] leading-relaxed text-public-body">
                Usar Acuerdo Alquiler no tiene costo.
              </p>
            </div>

            <div className="mx-auto flex max-w-sm flex-col gap-6 border-2 border-public-primary p-10 text-center">
              <span className="mx-auto w-fit border border-public-primary px-3.5 py-1.5 text-[12px] font-bold tracking-[0.1em] text-public-primary uppercase">
                Plan único
              </span>
              <div>
                <span className="text-5xl font-light text-public-ink">Sin costo</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-left text-[14.5px] text-public-body">
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-public-primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                  Propiedades e inquilinos sin límite
                </li>
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-public-primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                  Facturas, recordatorios y alertas
                </li>
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-public-primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>
                  Sin costo de configuración
                </li>
              </ul>
              <Link
                href="/registro"
                className="rounded-[3px] bg-public-primary px-6 py-3 text-[13px] font-bold tracking-[0.15em] text-white uppercase hover:bg-public-ink"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section id="preguntas" className="border-t border-public-border bg-public-surface">
          <div className="mx-auto max-w-3xl px-8 py-22 sm:px-16">
            <div className="mb-10 flex flex-col gap-3">
              <span className="text-[13px] font-semibold tracking-[0.12em] text-public-accent uppercase">Preguntas frecuentes</span>
              <h2 className="text-4xl font-light text-public-ink">Preguntas sobre el registro</h2>
            </div>
            <div className="flex flex-col border-t border-public-border">
              {PREGUNTAS.map((p) => (
                <details key={p.pregunta} className="group border-b border-public-border py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-public-ink marker:content-none">
                    {p.pregunta}
                    <span className="shrink-0 text-xl font-light text-public-muted group-open:hidden">+</span>
                    <span className="hidden shrink-0 text-xl font-light text-public-muted group-open:inline">−</span>
                  </summary>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-public-body">{p.respuesta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="relative overflow-hidden bg-public-ink">
          <img
            src="/images/marketing/seccion-oscura-producto.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-8 py-20 text-center sm:flex-row sm:px-16 sm:text-left">
            <div>
              <h2 className="text-3xl font-light text-white">
                Registre su primera <span className="text-public-accent">propiedad</span>
              </h2>
              <p className="mt-2 text-[16px] text-white/70">
                Cada pago y cada atraso quedan documentados desde el primer mes.
              </p>
            </div>
            <Link
              href="/registro"
              className="shrink-0 rounded-[3px] bg-white px-7 py-3.5 text-[13px] font-bold tracking-[0.15em] text-public-ink uppercase hover:bg-public-accent hover:text-white"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-public-border bg-public-surface">
        <div className="mx-auto max-w-6xl px-8 py-16 sm:px-16">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <Logo />
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-bold tracking-[0.08em] text-public-muted uppercase">Producto</span>
              <a href="#como-funciona" className="text-[14px] text-public-body hover:text-public-primary">Cómo funciona</a>
              <a href="#precios" className="text-[14px] text-public-body hover:text-public-primary">Precios</a>
              <a href="#preguntas" className="text-[14px] text-public-body hover:text-public-primary">Preguntas frecuentes</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-bold tracking-[0.08em] text-public-muted uppercase">Legal</span>
              <span className="text-[14px] text-public-body">Términos de uso</span>
              <span className="text-[14px] text-public-body">Política de privacidad</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-bold tracking-[0.08em] text-public-muted uppercase">Cuenta</span>
              <Link href="/login" className="text-[14px] text-public-body hover:text-public-primary">Iniciar sesión</Link>
              <Link href="/registro" className="text-[14px] text-public-body hover:text-public-primary">Crear cuenta</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-public-border px-8 py-5 sm:px-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[12px] text-public-muted sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Acuerdo Alquiler. Los datos de morosidad se registran solo cuando el inquilino fue notificado del reporte.</span>
            <span>Privacidad&nbsp;&nbsp;|&nbsp;&nbsp;Términos&nbsp;&nbsp;|&nbsp;&nbsp;Accesibilidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
