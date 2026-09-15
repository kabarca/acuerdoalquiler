import Link from "next/link";

const PASOS = [
  {
    numero: "1",
    titulo: "Registra tu propiedad y tu inquilino",
    texto:
      "Un formulario simple: dirección, nombre del inquilino, monto de la renta y el día en que se cobra cada mes.",
  },
  {
    numero: "2",
    titulo: "Le mandamos la factura y el link de pago",
    texto:
      "Tu inquilino recibe un correo con el detalle de la factura y un botón para pagar con tarjeta de débito o crédito.",
  },
  {
    numero: "3",
    titulo: "Tú ves todo desde un solo panel",
    texto:
      "Sabes al instante quién ya pagó, quién está pendiente y a quién hay que darle seguimiento.",
  },
];

const BENEFICIOS = [
  {
    titulo: "Pago con tarjeta, sin ir al banco",
    texto:
      "Tu inquilino paga con débito o crédito desde el celular, sin transferencias manuales ni comprobantes por WhatsApp.",
  },
  {
    titulo: "Recordatorios automáticos",
    texto:
      "Si el inquilino no ha pagado, el sistema le recuerda solo. Si el atraso se alarga, te avisamos a ti para que actúes a tiempo.",
  },
  {
    titulo: "Todo organizado en un solo lugar",
    texto:
      "Historial de facturas y pagos por propiedad e inquilino, sin hojas de cálculo ni mensajes perdidos.",
  },
];

const PREGUNTAS = [
  {
    pregunta: "¿Cómo empiezo a cobrar el alquiler en línea?",
    respuesta:
      "Creas tu cuenta de arrendador, registras la propiedad y los datos de tu inquilino, y el sistema se encarga de mandar la factura cuando corresponda.",
  },
  {
    pregunta: "¿Mi inquilino necesita crear una cuenta?",
    respuesta:
      "No. Tu inquilino solo recibe un correo con el link de pago y paga desde ahí, sin registrarse en nada.",
  },
  {
    pregunta: "¿Cuánto cuesta usar RentaCR?",
    respuesta:
      "Todavía estamos definiendo el modelo de precios mientras terminamos de construir el sistema. Por ahora está en fase de prueba.",
  },
  {
    pregunta: "¿Qué pasa si mi inquilino se atrasa?",
    respuesta:
      "El sistema le manda un recordatorio automático. Si el atraso sigue después de unos días, te avisamos a ti por correo para que puedas darle seguimiento a tiempo.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">RentaCR</span>
          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            <a href="#como-funciona" className="hover:text-foreground">
              Cómo funciona
            </a>
            <a href="#preguntas" className="hover:text-foreground">
              Preguntas frecuentes
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-muted">
              Pagos
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Cobra el alquiler{" "}
              <span className="text-primary">sin perseguir a nadie</span>
            </h1>
            <p className="mt-4 max-w-md text-balance text-muted">
              Registra tu propiedad y tu inquilino una sola vez. Nosotros
              mandamos la factura, cobramos con tarjeta y te avisamos si
              alguien se atrasa — para arrendadores en Costa Rica.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="rounded-lg bg-primary px-6 py-3 text-center text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
              >
                Crear cuenta gratis
              </Link>
              <a
                href="#como-funciona"
                className="rounded-lg border border-border bg-surface px-6 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs text-muted">condominio parques del sol</p>
            <p className="text-sm font-medium">Factura de alquiler</p>
            <div className="mt-4 rounded-xl bg-background p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Inquilino</span>
                <span>María Rojas</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted">Vence</span>
                <span>28/9/2026</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted">Estado</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                  Pendiente
                </span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-medium">
                <span>Monto</span>
                <span>₡400 000</span>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-primary px-3 py-3 text-center text-sm font-medium text-primary-foreground">
              Pagar con tarjeta
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Cóbralo en unos pasos simples
            </h2>
            <p className="mt-2 max-w-lg text-muted">
              Cobrar el alquiler en línea es rápido y cómodo para los dos
              lados — y te ayuda a mantener todo ordenado.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {PASOS.map((paso) => (
                <div key={paso.numero}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {paso.numero}
                  </span>
                  <h3 className="mt-4 font-medium">{paso.titulo}</h3>
                  <p className="mt-1 text-sm text-muted">{paso.texto}</p>
                </div>
              ))}
            </div>

            <Link
              href="/registro"
              className="mt-10 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
            >
              Empezar gratis
            </Link>
          </div>
        </section>

        {/* Beneficios */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Fácil para arrendadores e inquilinos
          </h2>
          <p className="mt-2 max-w-lg text-muted">
            Pagar el alquiler cada mes — y cobrarlo — se vuelve más cómodo
            para ambos.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {BENEFICIOS.map((b) => (
              <div
                key={b.titulo}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <h3 className="font-medium">{b.titulo}</h3>
                <p className="mt-2 text-sm text-muted">{b.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="preguntas" className="border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-3xl px-6 py-16">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Preguntas frecuentes
            </h2>

            <div className="mt-8 flex flex-col divide-y divide-border">
              {PREGUNTAS.map((p) => (
                <details key={p.pregunta} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                    {p.pregunta}
                    <span className="ml-4 text-muted group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm text-muted">{p.respuesta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Empieza a cobrar el alquiler en línea hoy
          </h2>
          <Link
            href="/registro"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-blue-700"
          >
            Crear cuenta gratis
          </Link>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>RentaCR</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="hover:text-foreground">
              Crear cuenta
            </Link>
          </div>
          <span>© 2026 RentaCR</span>
        </div>
      </footer>
    </div>
  );
}
