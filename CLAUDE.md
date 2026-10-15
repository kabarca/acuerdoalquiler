# Acuerdo Alquiler — Recordatorio y cobro de arriendo con métodos de pago

## Qué es este proyecto

Un sistema para que arrendadores en Costa Rica puedan enviar notificaciones de cobro, recordatorios
y eventualmente cobrarle el arriendo a sus inquilinos con un link de pago, entre otros.
El arrendador registra su
propiedad y su inquilino una sola vez; el sistema se encarga de mandar la factura, el link de pago,
recordar si no han pagado, y avisarle al arrendador si el inquilino se atrasa demasiado.

**Método de pago (2026-09-16):** por ahora Acuerdo Alquiler solo ofrece pago por **transferencia bancaria**
(el inquilino transfiere y sube comprobante, el arrendador lo confirma). El cobro con tarjeta vía
Onvopay sigue siendo el plan a futuro (ver sección Onvopay más abajo), pero está pausado. Si se reactiva, hay que revisar
`pagar/[facturaId]/page.tsx` e `invitacion/[id]/page.tsx`, que se simplificaron para mostrar solo
transferencia (el modelo de datos — enum `MetodoPago`, campos de Onvopay en `Factura` — se dejó
intacto para no tener que rehacerlo).

**Nombre del producto: Acuerdo Alquiler.** [acuerdoalquiler.com](https://acuerdoalquiler.com). 

## Visión de producto: por qué existe esto

Esto no es un simple cobrador de alquileres — es la razón de ser del producto, y debe guiar cualquier
decisión de producto o de diseño:

- **Quién invita a quién.** El arrendador (dueño de la propiedad) es quien tiene cuenta y quien
  **invita** a su inquilino a la plataforma — el inquilino nunca se registra por su cuenta (ver
  `invitarInquilino` y `/invitacion/[id]`, ya construidos).
- **Fuente única de verdad de las notificaciones.** Todo el ida-y-vuelta entre arrendador e inquilino
  —factura generada, "su pago vence en 5 días", "su pago vence en 3 días", aviso de atraso, confirmación
  de pago recibido— debe vivir y quedar registrado en Acuerdo Alquiler, no dispersarse en WhatsApp o
  correos sueltos. Esto ya existe parcialmente (`lib/resend.ts`, recordatorios, avisos); cualquier nuevo
  tipo de notificación (recordatorios a 5/3 días antes del vencimiento, por ejemplo) debe seguir el mismo
  patrón y quedar visible en el panel, no solo mandarse por correo.
- **La razón real de ser del producto: una lista negra de inquilinos morosos.** En Costa Rica hoy no
  existe ninguna forma de que un arrendador sepa, antes de alquilarle a alguien, si esa persona ha
  dejado de pagar en alquileres anteriores. Un inquilino puede alquilar un lugar, dejar de pagar durante
  cinco meses, mudarse a otra propiedad y repetir el patrón indefinidamente sin ninguna consecuencia.
  Acuerdo Alquiler existe para romper eso: construir un **registro histórico de comportamiento de pago
  por cédula**, consultable por cualquier arrendador antes de aceptar a un inquilino. Esto ya tiene una
  base construida — ver "Disputas y reputación" más abajo (`TenantProfile`, `TenantSearch`,
  `MarkDelinquent`, el campo `compartirHistorial`) — pero es el **diferenciador central**, no una
  función secundaria. Cualquier decisión de producto debería preguntarse: ¿esto fortalece la calidad y
  cobertura de ese registro?
- **Por qué es gratis por ahora.** El servicio no cobra (ver "Decisiones pendientes de Thomas") porque
  la prioridad actual es **masa crítica de arrendadores e inquilinos** — el registro de morosidad solo
  tiene valor disuasivo y de consulta si cubre suficiente mercado. Monetizar antes de tener esa cobertura
  sería sacrificar la razón de ser del producto por ingresos tempranos.

## Tono y posicionamiento de marca

Dado lo anterior, Acuerdo Alquiler necesita sentirse como una **entidad reguladora o un banco**, no como
una startup. Esto aplica a copy, color, tipografía y layout del **sitio público** (ver guía de estilo
abajo):

- **Serio, no simpático.** Nada de emojis, nada de tono "amigable de SaaS". El lenguaje debe sonar a
  entidad de registro/crédito: preciso, formal, con el peso de "esto queda anotado".
- **Cuadrado, no redondeado.** Esquinas rectas o casi rectas (radios mínimos, 0–3px), bordes finos y
  deliberados, sin sombras suaves de tarjeta flotante — layout de retícula, no de app consumer.
  Referencia visual: `jpmorgan.com/commercial-real-estate` (ver guía de estilo).
  **Fuente obligatoria: Fira Sans** (`fonts.google.com/specimen/Fira+Sans`), en todas sus variantes de
  peso — reemplaza a Space Grotesk/Public Sans en el sitio público.
- **"Fuente de verdad", no "app bonita".** El vocabulario y los componentes deben reforzar la idea de
  un registro oficial: notas al pie regulatorias, lenguaje de consentimiento explícito en formularios
  (igual que ya existe en `/invitacion/[id]` con `compartirHistorial`), fechas y cédulas visibles, nunca
  iconografía juguetona.
- Esto **no aplica al dashboard interno** (`/dashboard`, `/admin`), que sigue con el lenguaje visual
  actual — ver guía de estilo para el alcance exacto.

### Tono de voz en español (agregado 2026-10-16)

Kevin marcó el 2026-10-16 que el copy del sitio público sonaba "boty y salesy" — típico de landing
page de SaaS, no de una entidad seria. Se analizaron dos referencias reales antes de decidir:

- **`baccredomatic.com/es-cr` (descartada como modelo):** su copy de cara al consumidor usa voseo
  informal todo el tiempo ("Elegí", "Acumulá", "¡Contáctanos desde donde estés!") con signos de
  exclamación frecuentes — es un banco vendiendo tarjetas y promociones, no una entidad de registro.
  Ese tono encajaría peor con Acuerdo Alquiler, no mejor.
- **`equifax.co.cr` (la referencia real):** un buró de crédito — el mismo tipo de negocio que
  Acuerdo Alquiler (un registro consultable de comportamiento de pago), no un banco. Su copy:
  - **Cero signos de exclamación** en todo el sitio (hero, producto, empresas).
  - **Explica causa y efecto en vez de prometer beneficios:** "Conocer este detalle es vital para
    entender cómo te ven los bancos y entidades financieras." / "Dado que las entidades financieras
    revisan tu historial crediticio para definir si calificas para un préstamo, es importante que
    cuides tu comportamiento crediticio." — nunca "¡mejora tu vida financiera!", siempre "esto pasa,
    por eso importa".
  - **Vocabulario preciso de buró de crédito**, no genérico: "comportamiento crediticio", "historial
    crediticio", "información positiva/negativa", "deudas vencidas/sin vencer", "score de riesgo",
    "probabilidad de pago". Acuerdo Alquiler tiene su propio vocabulario equivalente — usarlo
    siempre, no inventar sinónimos marketineros: **"historial de pago"**, **"comportamiento de
    pago"**, **"registro de morosidad"**, **"reporte"**, **"disputa"** (ya existen como términos del
    producto, ver `Visión de producto` arriba y el modelo `Disputa`/`TenantProfile`).
  - **Viñetas utilitarias, no aspiracionales:** "Evita sorpresas de deudas fantasma", "Ordena tus
    finanzas estando al día" — suena a aviso de servicio público, no a copy de ventas.
  - **Botones y CTAs puramente transaccionales:** "Compra Aquí", "Obtener Aquí", "Ir a Cobranza" —
    el verbo más corto posible, sin adjetivo ni urgencia fabricada.
  - Nota: Equifax mezcla tú/usted/vos de forma inconsistente entre páginas (probablemente copy
    traducido sin pasar por una edición unificada) — **no** es un modelo a seguir en la persona
    gramatical. Acuerdo Alquiler mantiene **usted** en todo el sitio público, que ya estaba decidido
    y es consistente.

**Reglas concretas para todo el copy del sitio público** (y para cualquier copy nuevo que se
escriba después):
1. **Nunca usar signos de exclamación.**
2. **Nunca prometer una sensación o un tiempo** ("sin contratiempos", "sin complicaciones", "en
   menos de 5 minutos", "empiece ahora") — decir qué pasa y, cuando aplique, por qué importa. Mal:
   "Cobre el arriendo sin contratiempos." Bien: "Registre el cobro de alquiler y el historial de
   pago de su inquilino."
3. **Usted en todo el sitio público**, sin excepción — ni una etiqueta aislada en tú ("Agrega la
   propiedad" es un error, debe ser "Agregue la propiedad").
4. **"Alquiler"/"alquilar", nunca "renta"/"rentar"** — así se dice en Costa Rica. Excepción real:
   "declaración de renta" es el término correcto de Hacienda para el impuesto sobre la renta (ver
   `dashboard/pagos/certificado`) — ese "renta" específico no se toca, no es sinónimo del alquiler.
5. **Nada de frases de arranque de SaaS** ("Empiece ahora", "Simple, sin sorpresas", "todo en un
   solo lugar") — reemplazar por la descripción literal de qué hace el producto o qué dice el
   registro.

## Diseño: fuente de verdad

**Dos sistemas de diseño separados, según el alcance (ver "Tono y posicionamiento de marca" arriba):**

1. **Panel autenticado** (`/dashboard`, `/admin`): el diseño completo (24 pantallas) vive en un
   artifact de Claude Design que Thomas construyó: `https://claude.ai/artifact/34GUb3jZQBheak8fFXBXmk`.
   El **17 de septiembre de 2026 se reconstruyó toda la aplicación desde cero para igualar ese
   diseño** — cualquier trabajo previo (paleta genérica azul, nombre "Cobro de renta") quedó
   descartado. Ante cualquier duda de diseño del panel, ese artifact manda.

   **Paleta y tipografía del panel (tomadas literalmente del artifact):**
   - Fuentes: `Space Grotesk` (encabezados) + `Public Sans` (texto), vía `next/font/google`.
   - Colores (variables CSS en `globals.css`): `--ink #101826`, `--ink-soft #55637a`,
     `--ink-faint #8895a7`, `--bg #f5f8fb`, `--surface #fff`, `--border #e3e8f0`,
     `--primary #1f4e8c`, `--primary-dark #143a6b`, `--primary-light #eaf1fb`, `--accent #2f6fed`,
     `--success #157a4d`/`--success-bg #e7f6ee`, `--warning #a8660f`/`--warning-bg #fdf1de`,
     `--danger #b93a2b`/`--danger-bg #fbe9e6`.
   - Sidebar del panel: fondo `--primary-dark`, texto claro, ítem activo con fondo `white/10`.

2. **Sitio público** (`src/app/(marketing)`, `src/app/(auth)` — visitante sin sesión): guía de estilo
   separada, construida el 2026-10-13 a pedido de Kevin, con el lenguaje visual de
   `jpmorgan.com/commercial-real-estate` (colores y componentes medidos del DOM real) pero con
   **Fira Sans** como tipografía en vez de la fuente propietaria de JPMorgan:
   `https://claude.ai/artifact/3EQNGHp5ZKHsL34y1zDVms` (4 artboards: Fundamentos, Componentes A,
   Componentes B, Imágenes). Tokens clave: `--ink #101820`, `--chrome #31373D`, `--primary #1A7B99`,
   `--primary-light #2B9AB3`, `--accent #AF8462` (gold), radios casi nulos (3px botones, 0px
   tarjetas), sin sombras.

   **Implementada en código el 2026-10-15.** Tokens nuevos en `globals.css` bajo su propio namespace
   — `--color-public-ink`, `--color-public-primary`, etc. (prefijo `public-*`, nunca pisa
   `--color-ink`/`--color-primary` del panel) — más una regla scoped `.theme-public h1..h4` para que
   Fira Sans solo aplique ahí. `Fira Sans` se carga vía `next/font/google` en
   `src/app/(marketing)/layout.tsx` (nuevo) y en `src/app/(auth)/layout.tsx`; ambos envuelven su
   contenido en `className="theme-public font-fira"`. El panel (`/dashboard`, `/admin`) nunca tiene
   esa clase, así que sigue viéndose exactamente igual que antes — confirmado visualmente. Página
   home (`(marketing)/page.tsx`) reescrita sección por sección con el tema nuevo y las 8 imágenes
   generadas (`hero-home.png` en el hero, `paso-1/2/3-*.png` en "Cómo funciona",
   `seccion-oscura-producto.png` en la banda CTA final, `cita-institucional-fondo.png` como textura
   detrás de la cita). Se agregaron 3 secciones nuevas que no existían antes: bloque de cifras y cita
   institucional (ambos con **marcadores de contenido** tipo `[XX%]`/`[Nombre]`, explícitamente
   comentados en el código — reemplazar antes de publicar, no son datos reales) y un acordeón de FAQ
   con copy real (no inventado) sobre el registro de morosidad, consentimiento y método de pago.
   `miniatura-articulo.png` y `retrato-equipo.png` siguen sin usarse (no hay blog ni página de equipo
   todavía). Formularios de `/login` y `/registro` también re-skinned (inputs/botón cuadrados).

   **Generación de imágenes de marketing (agregado 2026-10-13, revisado 2026-10-14):**
   `scripts/generate-marketing-images.mjs` (`npm run generate:images`) llama a la API de Kie.ai con
   los 8 prompts del artboard "Imágenes" del artifact de arriba, y guarda el resultado en
   `public/images/marketing/`. Requiere `KIE_API_KEY` en `.env.local` — nunca se commitea. El script
   y la sección 22 del artifact deben mantenerse sincronizados a mano si se edita un prompt.
   **Las 8 imágenes ya se generaron dos veces** y están en `public/images/marketing/` — aún no
   referenciadas desde ningún componente, eso queda pendiente.
   - **Motor: GPT Image 2.5, no Flux** (campo `engine` por prompt en el script, default
     `"gpt-image"`). La primera tanda (2026-10-13) usó Flux Kontext Pro y salió demasiado "foto de
     inmobiliaria" — Kevin la rechazó comparándola con 4 banners reales de bancos (recorte gráfico muy
     cerrado, ángulo bajo/oblicuo extremo, edificio como patrón geométrico, gran espacio de cielo
     limpio para texto). Se reescribieron `hero`, `seccion-oscura` y `blog` con esa dirección y se
     regeneraron las 8 con GPT Image 2.5, que sigue instrucciones de encuadre con más fidelidad.
     Flux sigue disponible (`engine: "flux"`) por si algún prompt puntual rinde mejor ahí.
   - **Dos endpoints distintos de Kie.ai, mismo `/jobs/recordInfo` para consultar estado:** Flux usa
     `POST /flux/kontext/generate` (body plano: `prompt`, `aspectRatio`, …); GPT Image usa el
     endpoint genérico `POST /jobs/createTask` (body anidado: `{model, input: {prompt,
     aspect_ratio, resolution}}`) — confirmado contra la API real, no solo la documentación.
   - **Gotcha real:** el endpoint de Flux rechaza `aspectRatio: "3:2"` con "formatted incorrectly"
     aunque está documentado como válido; el endpoint de GPT Image sí lo acepta — por eso el hero usa
     `3:2` vía GPT Image en vez del `4:3` de la primera tanda.

## Quién usa el sistema

- **Arrendador**: el que se registra en el sistema. Tiene una o más propiedades y quiere que sus
  inquilinos le paguen por este medio. Es quien tiene cuenta y login.
- **Inquilino**: NO tiene cuenta. Recibe un correo con la factura y un link de pago. Paga desde ahí.

## Flujo funcional paso a paso

1. El arrendador se registra e inicia sesión.
2. El arrendador registra una propiedad (dirección, tipo, cantón) y un inquilino para esa propiedad
   (nombre, correo, teléfono, monto de la renta, fechas de contrato) en un solo formulario con
   indicador de pasos. Ahí mismo programa la facturación con tres fechas (días 1-28 de cada mes):
   cuándo se **genera** la factura, cuándo se **envía** al inquilino y la **fecha máxima de pago**.
3. El sistema genera y envía las facturas solo (ver "Facturación automática" abajo): crea la factura el
   día de generación y la manda por correo el día de envío, con la fecha máxima de pago bien visible
   y un link de pago (transferencia bancaria, por ahora).
4. El inquilino paga desde el link, sin necesidad de cuenta.
5. Si el inquilino no ha pagado después de unos días, el sistema le manda un correo recordatorio.
6. Si sigue sin pagar después de un periodo mayor (a definir), el sistema le avisa al arrendador por
   correo para que tome acción.
7. El arrendador ve en su panel (barra lateral: Panel / Propiedades / Inquilinos / Pagos /
   Configuración / Ayuda) el estado de cada inquilino: pagado, pendiente, atrasado.

## Ya construido (reconstruido 2026-09-15/17 sobre las 24 pantallas del artifact)

Landing, cuenta y panel principal:
- [x] Landing pública con hero, "cómo funciona", beneficios y CTA (`Main`)
- [x] Registro/login de arrendadores (Supabase Auth) con panel de marca a la izquierda (`Register`)
- [x] Panel (`/dashboard`): tarjetas de resumen (cobrado, pendientes, vencidos) + tabla combinada (`Dashboard`)
- [x] Propiedades en tarjetas (`/dashboard/propiedades`) con tipo, cantón, inquilino, badge de estado (`Properties`)
- [x] Alta combinada de propiedad + inquilino + condiciones de pago en un solo formulario
      (`/dashboard/propiedades/nueva`, `AddProperty`)
- [x] Detalle de propiedad: tarjeta de inquilino + historial de pagos (`/dashboard/propiedades/[id]`, `PropertyDetail`)
- [x] Configuración: datos de cuenta, cuenta bancaria (para transferencias) con opción de cuenta en
      Costa Rica o internacional (agrega SWIFT/BIC, país, dirección del banco, dirección del
      titular y ruta ABA opcional — ver `TipoCuentaBancaria` en el schema y
      `dashboard/configuracion/datos-bancarios-form.tsx`), estado de integraciones

Cobro e invitación al inquilino:
- [x] Página pública de pago (`/pagar/[facturaId]`, `PaymentPage`) — solo transferencia bancaria por
      ahora (débito/crédito quedaron pausados, ver nota de método de pago arriba), estados PAGADA /
      EN_REVISION / pendiente
- [x] Pago por transferencia bancaria: el inquilino sube comprobante (`PaymentTransfer` → `TransferPending`),
      el arrendador lo confirma o rechaza (`/dashboard/facturas/[id]/confirmar`, `LandlordConfirmPayment`) — el
      archivo se guarda como bytes en la propia base de datos, servido por `/comprobante/[facturaId]`
- [x] Invitar al inquilino a configurar su propio método de pago (`invitarInquilino` + correo) → pantalla
      pública `/invitacion/[id]` (`TenantOnboarding`) donde elige método, ve los datos bancarios, pone su
      cédula y autoriza (o no) compartir su historial
- [x] Generación manual de factura y "marcar como vencida" (botones de prueba) para no depender del cron
- [x] Correos con el mismo lenguaje visual: factura, recordatorio, aviso al arrendador, invitación (`lib/resend.ts`)

Disputas y reputación:
- [x] Al escalar un atraso se abre una `Disputa` (botón de prueba "Abrir disputa"); pantalla de disputa
      abierta con opción de registrar la respuesta del inquilino (`/dashboard/disputas/[id]`, `DisputeNotification`)
- [x] Otorgar prórroga (`.../prorroga`, `GrantExtension`) — reabre la factura con nueva fecha, cierra la disputa
- [x] Marcar moroso (`.../moroso`, `MarkDelinquent`) — requiere motivo obligatorio y checkbox de confirmación
- [x] Vista de disputa resuelta con línea de tiempo (`DisputeResolved`)
- [x] Buscar inquilino por nombre/cédula entre TODOS los arrendadores (`/dashboard/inquilinos`, `TenantSearch`)
      — solo aparecen los que autorizaron `compartirHistorial`
- [x] Perfil de reputación agrupado por cédula: alquileres previos, disputas, historial de alquileres
      (`/dashboard/inquilinos/[cedula]`, `TenantProfile`) — "Referencia completa por ₡8.000" queda visual/
      deshabilitada, no hay cobro real de ese micro-pago
- [x] Quitar inquilino con motivo de salida (`/dashboard/propiedades/[id]/quitar-inquilino`,
      `RemoveTenantFeedback`) — es soft-delete (`activo=false`), NUNCA se borra la fila, para que su
      historial de alquileres anteriores se siga viendo en su perfil de reputación

Pagos y reportes:
- [x] Pagos y transacciones con estadísticas, filtros por rango (mes/90 días/año), exportar CSV real
      (`/dashboard/pagos/exportar`) y certificado anual de ingresos imprimible (`/dashboard/pagos/certificado`,
      botón "Imprimir / Guardar como PDF" — no genera un PDF binario, usa el diálogo de impresión del navegador)

Soporte y administración (no forman parte del artifact, agregadas el 2026-09-16 a pedido de Thomas):
- [x] `/dashboard/ayuda`: sección para que el arrendador contacte al soporte de Acuerdo Alquiler por WhatsApp
      (link `wa.me` con mensaje prellenado). El número vive en `src/lib/config.ts`
      (`SOPORTE_WHATSAPP_NUMERO`) — **hoy es un número de relleno (`50600000000`), falta que Thomas
      dé el número real de soporte.**
- [x] `/admin`: panel interno solo para el equipo de Acuerdo Alquiler (no para arrendadores) — muestra el total
      de arrendadores, propiedades e inquilinos activos. Protegido por el campo `esAdmin` en
      `Arrendador` (`false` por defecto, nunca se ofrece en el registro público) vía
      `getAdminActual()` en `lib/auth.ts`; `proxy.ts`/`middleware.ts` también exige sesión para
      `/admin` igual que para `/dashboard`. La cuenta de prueba (`arrendador@prueba.local`) se marcó
      `esAdmin=true` a mano con `prisma db execute` para poder probarlo — una cuenta real de
      arrendador nunca debería tener este campo en `true`. El sidebar del panel muestra un enlace
      "Panel admin" solo si `esAdmin` es `true`.
      Cada tarjeta de `/admin` es un link a un detalle (agregado el 2026-09-17 a pedido de Thomas):
      `/admin/arrendadores`, `/admin/propiedades`, `/admin/inquilinos` (todos los inquilinos, con
      badge de estado: Al día / Factura vencida / Moroso / Inactivo) y `/admin/morosos` (solo los
      inquilinos con una factura en estado `ATRASADA` o con una `Disputa` resuelta como `MOROSO`,
      con el monto total atrasado). La tarjeta "Morosos / sin pagar" en `/admin` usa la misma
      condición `OR` para el conteo.

**Verificación de identidad del inquilino** (agregada el 2026-09-21 a pedido de Thomas, inspirada en
una conversación con Gemini sobre el mismo problema — ver también el modelo `VerificacionIdentidad`
en `schema.prisma`):
- [x] Desde `/dashboard/propiedades/[id]` el arrendador le manda al inquilino (por correo, vía
      `enviarVerificacionIdentidad` en `lib/resend.ts`) un link tipo `/verificar/[token]` que vence en
      48h. El inquilino lo abre en su celular — sin descargar nada — y ahí mismo toma foto de su
      cédula (`capture="environment"`) y una selfie (`capture="user"`) con inputs nativos de HTML.
- [x] **El match de rostros corre en el navegador del inquilino**, no en el servidor — usa
      `@vladmandic/face-api` (TensorFlow.js) cargando los modelos desde `/public/models` vía
      `loadFromUri`, calcula la distancia euclidiana entre ambas fotos (umbral 0.6, igual que
      `face_recognition` en Python) y manda el resultado junto con las fotos. Esta decisión fue
      deliberada, no un atajo: se intentó primero correrlo en el servidor con
      `@tensorflow/tfjs-node`, pero requiere compilar bindings nativos (falla en este entorno —
      además el path del proyecto tiene un espacio, lo cual rompe el build de `node-gyp` — y tampoco
      es viable en Vercel serverless). La build de Node de `@vladmandic/face-api` además exige
      `tfjs-node` sí o sí. Correrlo en el navegador evita todo eso y es gratis.
      **Importante:** como el resultado del match lo calcula y reporta el cliente, es una señal de
      apoyo, no una prueba de seguridad — por eso el arrendador también ve ambas fotos en
      `/dashboard/verificaciones/[id]` para confirmar a simple vista.
- [x] El texto de la cédula se extrae con OCR **en el servidor** con `tesseract.js` (lang `spa`)
      dentro de `procesarVerificacion` (`verificar/[token]/actions.ts`) — puramente informativo para
      el arrendador, no se usa para validar nada automáticamente. **`tesseract.js` tuvo que agregarse
      a `serverExternalPackages` en `next.config.ts`**: si Turbopack lo empaqueta, se rompe la
      resolución de su worker en tiempo de ejecución (`Cannot find module .../worker-script/node/
      index.js`) — si se actualiza `tesseract.js` y vuelve a fallar, empezar por ahí.
- [x] Fotos guardadas como `Bytes` en `VerificacionIdentidad` (mismo patrón que `comprobanteBytes` en
      `Factura` — no hay bucket de almacenamiento configurado). Se sirven vía
      `/foto-verificacion/[verificacionId]/[tipo]/route.ts`, protegida por sesión y solo al
      arrendador dueño del inquilino (igual que `/comprobante/[facturaId]`).
- **Pendiente (no bloqueante para probar, sí antes de producción):** la pantalla de `/verificar/[token]`
  no tiene un checkbox explícito de consentimiento como el de `compartirHistorial` en `/invitacion` —
  solo un aviso de "sus fotos quedan cifradas". Cédula + selfie es dato sensible; antes de lanzar de
  verdad valdría la pena agregar un consentimiento explícito y revisar si aplica alguna norma de
  protección de datos en Costa Rica para este tipo de dato.

**Verificación de identidad — solo del INQUILINO, no del arrendador** (el 2026-09-22 se probó y se
llegó a construir también una verificación obligatoria del lado del arrendador — cédula/pasaporte +
selfie, bloqueando el registro de propiedades hasta aprobarse — pero Thomas pidió revertirla ese mismo
día: "ya no necesito que este proceso sea para el arrendatario solo para el inquilino". Se borró todo
ese código, la tabla de columnas en `Arrendador` (con `--accept-data-loss`, confirmado explícitamente
por Thomas dos veces por la protección propia de Prisma) y la pestaña/tarjeta de admin correspondientes.
Si en el futuro se vuelve a pedir algo así para el arrendador, el patrón a seguir es el mismo que ya
funciona para el inquilino, descrito abajo — no hace falta reinventarlo.):
- [x] **Bug real encontrado y arreglado, sigue aplicando:** las fotos tomadas con la cámara nativa de
      un iPhone a veces se suben en formato **HEIC**, que ningún navegador puede mostrar en un `<img>`
      ni face-api puede leer para comparar rostros — el match fallaba en silencio ("no se detectó
      rostro") y la miniatura quedaba rota, sin aviso de qué pasó. Se agregó conversión a JPEG en dos
      capas, y sigue en pie porque la usa la verificación del inquilino:
      - **En el navegador**, apenas se elige el archivo (`src/lib/heic-cliente.ts`,
        `convertirSiEsHeic()`, usa `heic-convert/browser` con `libheif-js`/WASM) — esto es lo que
        arregla la vista previa Y el match de rostros, porque ambos pasan por el archivo ya convertido.
      - **En el servidor**, como respaldo (`src/lib/normalizar-imagen.ts`, `normalizarImagen()`, mismo
        `heic-convert` pero build de Node) por si la conversión del navegador falla por alguna razón.
      - `heic-convert` está en `serverExternalPackages` en `next.config.ts` junto con `tesseract.js`,
        por el mismo motivo (carga un WASM en tiempo de ejecución que Turbopack rompe si lo empaqueta).

**Facturación automática** (agregada el 2026-10-05 a pedido de Thomas):
- [x] Campos en `Inquilino`: `diaGeneracion`, `diaEnvio` (default 1) y `diaCobro` (= fecha máxima de
      pago, ya existía; antes se llamaba "día de vencimiento"). Se fijan con `CamposFacturacion`
      (`components/campos-facturacion.tsx`) al registrar o editar al inquilino. El envío nunca queda
      antes de la generación. Si `diaCobro` < `diaEnvio` la fecha máxima cae en el mes siguiente
      (`calcularFechaVencimiento` en `lib/facturacion.ts`). `Factura` ganó `facturaEnviadaEn` y
      `errorEnvio`.
- [x] `GET /api/cron/facturas` (`app/api/cron/facturas/route.ts`) lo llama Vercel Cron todos los días
      a las 12:00 UTC = 6:00 a. m. Costa Rica (`vercel.json`). Exige `Authorization: Bearer
      $CRON_SECRET` (Vercel lo manda solo si `CRON_SECRET` está en las variables del proyecto — **hay
      que definirlo en Vercel al desplegar**; en `.env` local ya hay uno). Llama a
      `procesarFacturacionAutomatica()`: crea la factura del mes si ya pasó el día de generación y
      manda por correo las pendientes cuyo día de envío ya llegó. Compara con `>=` (no `==`), así que
      es idempotente y si un día falla el cron se recupera solo. "Hoy" se calcula en hora de Costa
      Rica, no UTC.
- [x] Un inquilino registrado **después** del día de generación de ese mes empieza a facturarse el mes
      siguiente (el arrendador puede crear la de este mes a mano con el botón "Generar factura").
- [x] **Todo el envío de correos pasa por `intentarEnvio()`** (`lib/resend.ts`). Si `RESEND_API_KEY`
      está vacía (Thomas dejó Resend para más adelante, 2026-10-05) ni siquiera lo intenta: devuelve
      "El envío de correos todavía no está configurado" al instante. Si hay llave, revisa
      `resultado.error` porque el SDK de Resend **no lanza excepción** cuando falla. `facturaEnviadaEn`
      / `correoEnviadoEn` / `invitacionEnviadaEn` solo se llenan cuando el correo de verdad salió, así
      que "Enviada el…" ya no miente. Cuando se conecte Resend, empieza a funcionar sin tocar código.
- [x] **Aviso al arrendador si una factura no se envió** (en la app, no por correo, porque el correo es
      justo lo que no está disponible): sección "Avisos" arriba del Panel (`dashboard/page.tsx`) y
      dentro de la propiedad (`components/aviso-factura.tsx`), con "Copiar enlace de pago" (para
      mandarlo por WhatsApp) y "Ya se la envié" (`marcarFacturaEnviadaManual`). El aviso se calcula
      del estado real (factura del mes `PENDIENTE`, sin `facturaEnviadaEn`, ya pasó el día de envío),
      así que aparece aunque el cron no haya corrido. Cuando haya Resend se puede sumar un correo
      al arrendador, pero no se hizo.
- [x] Eficiencia del cron: sin llave de correo no hace llamadas de red, y procesa los inquilinos de 10
      en 10 en paralelo (`maxDuration = 60` en la ruta). Vercel Hobby solo permite cron diario; si
      alguna vez se necesita reintentar varias veces al día hay que pasar a Pro o llamar la ruta
      desde un programador externo.
- [x] La fecha máxima de pago aparece en el correo (recuadro destacado), en el asunto, y en
      `/pagar/[facturaId]`.
- [x] **Verificación del inquilino automática al registrarlo**: `crearPropiedadConInquilino` y
      `crearInquilino` llaman a `crearYEnviarVerificacion()` (`lib/verificacion-inquilino.ts`, el
      mismo que usa el botón "Generar enlace nuevo y reenviar"). El enlace ahora vence en **7 días**
      (antes 48 h) porque, sin correo, el arrendador puede tardar en pasárselo. `VerificacionIdentidad`
      ganó `correoEnviadoEn` y `errorEnvio`. Si el correo no salió, el Panel avisa y la propiedad
      muestra el enlace para copiar. La propiedad muestra "✓ Verificado" cuando el inquilino terminó
      y los rostros coincidieron (o "Por revisar" si no), y el Panel avisa por 7 días cuando alguien
      completa su verificación.
- [x] `/verificar/[token]?previa=1` es la **vista previa** que ve el arrendador ("Ver lo que ve el
      inquilino" en la propiedad): recorre las mismas pantallas pero no envía nada.
- **Sin probar de punta a punta:** el envío exitoso real (falta Resend). Sí se probó: generación sin
  duplicar, cálculo de fechas, que sin correo se marque "no enviada" con el motivo, los avisos, el
  botón "Ya se la envié", y el flujo completo de la vista previa.

**Flujo de inicio rápido para visitantes anónimos** (agregado 2026-10-15, construido completo de
punta a punta, probado manualmente en el navegador):
- [x] El visitante puede empezar a registrar una propiedad **sin crear cuenta**. Home
      (`src/app/(marketing)/inicio-rapido.tsx`) tiene un campo "Agrega la propiedad" que guarda el
      texto en `sessionStorage` (`src/lib/draft-propiedad.ts`) y lleva a `/comenzar/propiedad`
      (nueva ruta pública, vive dentro de `src/app/(marketing)/comenzar/propiedad/` para heredar
      Fira Sans/`theme-public` del layout de marketing aunque la URL no tenga el grupo de rutas).
      Ahí completa tipo de propiedad, Provincia/Cantón/Distrito y condiciones de pago — todo sigue
      sin tocar el servidor. Al hacer clic en "Guardar y crear cuenta" (o "Inicie sesión" si ya
      tiene cuenta), el draft se guarda y lo manda a `/registro?next=...` o `/login?next=...`.
- [x] **Provincia/Cantón/Distrito son datos reales**, no texto libre: `provincia`/`distrito` son
      columnas nuevas en `Propiedad` (`canton` ya existía) — ver migración de abajo. El catálogo
      completo (7 provincias, 84 cantones, 494 distritos) vive en
      `src/lib/ubicaciones-costa-rica.ts`, extraído el 2026-10-10 de la **División Territorial
      Administrativa 2026 del IGN** (fuente oficial, URL del PDF en el comentario del archivo) vía
      la API pública `ubicaciones-cr.ryze-cr.workers.dev` — no se inventó ni se tipeó a mano. El
      cascadeo Provincia→Cantón→Distrito vive en `src/components/ubicacion-selects.tsx`
      (`tema="public"` o `tema="panel"` según dónde se use) y ya está integrado tanto en
      `/comenzar/propiedad` como en `/dashboard/propiedades/nueva`.
- [x] `/registro` y `/login` aceptan `?next=` (validado en `siguientePaso()`, `lib/auth.ts` — solo
      rutas propias que empiezan con `/`, nunca `//`, para evitar open redirect) y redirigen ahí en
      vez de `/dashboard` siempre que esté presente, incluyendo en el camino de error. El link
      cruzado "¿Ya tiene cuenta?/¿Todavía no tiene cuenta?" entre ambas páginas preserva el `next`.
- [x] `/dashboard/propiedades/nueva` (vía `nueva-propiedad-form.tsx`, extraído de `page.tsx` para
      poder ser cliente sin convertir toda la página) lee el draft de `sessionStorage` al cargar y
      pre-llena la sección de propiedad, dejando la de inquilino vacía — el arrendador recién
      registrado retoma exactamente donde quedó como anónimo. El draft se limpia al enviar el
      formulario (optimista: se limpia aunque el envío falle, es una limitación conocida y
      aceptada). Esta pantalla **sigue con el tema del panel**, no con `theme-public`.
- **Migración de esquema:** `provincia String?` y `distrito String?` agregados a `Propiedad` y ya
  aplicados a la base real con `npm run db:push` (2026-10-15) — opcionales a nivel de BD para no
  romper filas existentes, requeridos en los formularios nuevos.
- **Gotcha real de implementación — `useSyncExternalStore`, no `useEffect` + `setState`:** leer el
  draft de `sessionStorage` al montar con `useEffect(() => setDraft(leerDraft()), [])` dispara el
  lint error `react-hooks/set-state-in-effect` de `eslint-config-next` (Compiler-era rule). El
  arreglo correcto es `useDraftPropiedad()` (hook en `draft-propiedad.ts`) con
  `useSyncExternalStore` — pero **`getSnapshot` debe devolver la misma referencia si el dato no
  cambió** (`leerDraft()` cachea contra el string crudo de `sessionStorage`, si no, React tira
  "getSnapshot should be cached to avoid an infinite loop" porque `JSON.parse` crea un objeto
  nuevo en cada llamada). Además, pasar `defaultProvincia`/`defaultCanton`/`defaultDistrito` como
  prop a `UbicacionSelects` no alcanza — su `useState` interno solo captura el valor inicial una
  vez y no se actualiza cuando el draft resuelve después del primer render; hace falta forzar un
  remount con `key={draft ? "con-draft" : "sin-draft"}` en el `<UbicacionSelects>` del padre.
- **Otro gotcha real:** `prisma7.config.ts` usaba `import "dotenv/config"` a secas, que solo lee
  `.env`, no `.env.local` (eso es una convención de Next.js, no de `dotenv`) — `prisma generate`
  no lo necesitaba (no toca la BD) pero `prisma db push`/`prisma studio` sí, y fallaban con
  "datasource.url property is required". Se corrigió a `config({ path: ".env.local" })` explícito.
- **Y otro:** después de correr `prisma generate` con el schema nuevo, el servidor de desarrollo
  que ya estaba corriendo seguía usando el cliente de Prisma viejo en memoria (no reconocía
  `provincia`/`distrito`, tiraba `PrismaClientValidationError: Unknown argument`) — hace falta
  reiniciar `next dev` después de regenerar el cliente, Turbopack no lo recoge solo.
- **Probado de punta a punta en el navegador**, ambos caminos: creando cuenta nueva (bloqueado en
  este entorno porque Supabase rechaza dominios de correo tipo `.local`/`example.com` como
  inválidos — no es un bug del código, `/registro` ya hacía la misma llamada `auth.signUp()` antes
  de este cambio) y con la cuenta de prueba existente vía login — el segundo caso sí se completó
  entero: login → aterrizó en `/dashboard/propiedades/nueva?draft=1` pre-llenado → se completó el
  inquilino → se guardó → se confirmó en la base real que `provincia`/`canton`/`distrito` quedaron
  correctos → se borró la propiedad de prueba para no dejar datos falsos.

## Fuera de alcance (deliberado, no es una pantalla del artifact)

- Pago automático recurrente con tarjeta guardada (el toggle existe visualmente en `PaymentPage` pero no
  está wireado — depende de que Onvopay esté conectado de verdad, con tokenización de tarjeta).
- El microcobro de "Referencia completa por ₡8.000" en el perfil de reputación — no hay pasarela para
  cobrar montos pequeños al propio arrendador todavía.

Los archivos fuente de las 24 pantallas del artifact están (o estaban) extraídos en
`/tmp/rentia-design/*.dc.html` — es un directorio temporal de una sesión anterior, no forma parte del
repo; si ya no existen, releer el artifact en la URL de arriba.

## Procesador de pagos: Onvopay

Stripe no opera cuentas de comercio en Costa Rica (no puede liquidar a bancos costarricenses), así
que el cobro se hace con **Onvopay**, fintech costarricense con API REST moderna (llaves de
prueba/producción, publishable/secret key, webhooks) — ver `docs.onvopay.com`. Comisión aproximada:
3.9% + $0.25 por cobro con tarjeta (verificar tarifa vigente antes de lanzar). Thomas todavía no
tiene cuenta creada — hay que crearla antes de poder cobrar de verdad; mientras tanto el botón de
pago queda deshabilitado con un aviso, en vez de simular un cobro falso.

**Importante (seguridad):** la pantalla de pago muestra campos de número de tarjeta/CVV para igualar
el diseño, pero esos campos están deshabilitados — el formulario NUNCA debe enviar datos de tarjeta
en crudo a nuestro propio servidor. Cuando se conecte Onvopay de verdad, el cobro debe hacerse vía su
checkout/SDK (tokenización), redirigiendo o embebiendo su flujo — nunca capturando el PAN nosotros.

## Stack técnico

Mismo stack que el proyecto de Restauración Láser de Thomas, para no mezclar tecnologías — pero en
un repositorio y proyecto totalmente separados, sin dependencias entre ambos:

- **Frontend/Backend:** Next.js 16 (App Router), TypeScript, Tailwind v4
- **Base de datos:** Supabase (Postgres + Auth) — proyecto real ya conectado, ver `.env`
- **ORM:** Prisma 7 (driver adapter `@prisma/adapter-pg`, no el motor por defecto)
- **Correo:** Resend (factura, recordatorio, aviso al arrendador)
- **Cobro con tarjeta:** Onvopay (pendiente cuenta real)
- **Verificación de identidad:** `@vladmandic/face-api` + `@tensorflow/tfjs` (match de rostros, corre
  en el navegador del inquilino) y `tesseract.js` (OCR de la cédula, corre en el servidor)
- **Programador de tareas:** Vercel Cron — ya corre la facturación automática (`vercel.json`); los
  recordatorios al inquilino atrasado siguen pendientes de implementar
- **Hosting:** Vercel (pendiente desplegar)

## Privacidad y datos

- El inquilino no crea cuenta — sus datos los ingresa el arrendador. Hay que ser claro en el correo
  de factura sobre quién le está cobrando y por qué tiene sus datos.
- Datos de tarjeta nunca tocan el servidor propio — ver nota de seguridad arriba.
- Foto de cédula + selfie del inquilino (ver Verificación de identidad arriba) es dato sensible — hoy
  se guarda sin cifrar en la misma base de datos (igual que el comprobante de transferencia) y sin
  checkbox de consentimiento explícito. Revisar antes de producción.

## Decisiones pendientes de Thomas (preguntar antes de asumir)

- Modelo de cobro del sistema: ¿suscripción al arrendador, comisión por transacción, o ninguna por
  ahora? (respondió "aún no lo sé, decidir después")
- Después de cuántos días sin pagar se manda el recordatorio al inquilino, y después de cuántos días
  más se abre la disputa / se le avisa al arrendador (el cron todavía no está implementado — hoy son
  botones manuales de prueba: "Marcar como vencida" y "Abrir disputa").
- **Número real de WhatsApp de soporte** para `SOPORTE_WHATSAPP_NUMERO` en `src/lib/config.ts` (hoy
  tiene un número de relleno).

## Credenciales de prueba (solo para desarrollo local)

Cuenta de arrendador creada directamente en Supabase Auth (ya confirmada, sin pasar por el flujo de
registro) para poder probar el sistema sin cuentas reales:

- Correo: `arrendador@prueba.local`
- Contraseña: `Prueba1234!`
- Tiene `esAdmin=true`, así que con esta cuenta también se puede ver `/admin`.

## Git

El proyecto es un repositorio git local (`git init` hecho el 2026-09-15, no hay remoto configurado
todavía). Hay un commit de respaldo justo antes del rediseño completo por si algo necesita
recuperarse: `git log --oneline`.
