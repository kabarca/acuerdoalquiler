# Rentia — cobro de arriendo con tarjeta

## Qué es este proyecto

Un sistema para que arrendadores en Costa Rica puedan cobrarle el arriendo a sus inquilinos en línea,
sin que el inquilino tenga que ir al banco a hacer una gestión presencial. El arrendador registra su
propiedad y su inquilino una sola vez; el sistema se encarga de mandar la factura, el link de pago,
recordar si no han pagado, y avisarle al arrendador si el inquilino se atrasa demasiado.

**Método de pago (2026-09-16):** por ahora Rentia solo ofrece pago por **transferencia bancaria**
(el inquilino transfiere y sube comprobante, el arrendador lo confirma). El cobro con tarjeta vía
Onvopay sigue siendo el plan a futuro (ver sección Onvopay más abajo), pero está pausado — no se
muestra como opción en ninguna pantalla mientras tanto. Si se reactiva, hay que revisar
`pagar/[facturaId]/page.tsx` e `invitacion/[id]/page.tsx`, que se simplificaron para mostrar solo
transferencia (el modelo de datos — enum `MetodoPago`, campos de Onvopay en `Factura` — se dejó
intacto para no tener que rehacerlo).

**Nombre del producto: Rentia.**

## Diseño: fuente de verdad

El diseño completo (24 pantallas) vive en un artifact de Claude Design que Thomas construyó:
`https://claude.ai/artifact/34GUb3jZQBheak8fFXBXmk`. El **17 de septiembre de 2026 se reconstruyó
toda la aplicación desde cero para igualar ese diseño** — cualquier trabajo previo (paleta genérica
azul, nombre "Cobro de renta") quedó descartado. Ante cualquier duda de diseño, ese artifact manda,
no las decisiones tomadas antes de esa fecha.

**Paleta y tipografía (tomadas literalmente del artifact):**
- Fuentes: `Space Grotesk` (encabezados) + `Public Sans` (texto), vía `next/font/google`.
- Colores (variables CSS en `globals.css`): `--ink #101826`, `--ink-soft #55637a`,
  `--ink-faint #8895a7`, `--bg #f5f8fb`, `--surface #fff`, `--border #e3e8f0`,
  `--primary #1f4e8c`, `--primary-dark #143a6b`, `--primary-light #eaf1fb`, `--accent #2f6fed`,
  `--success #157a4d`/`--success-bg #e7f6ee`, `--warning #a8660f`/`--warning-bg #fdf1de`,
  `--danger #b93a2b`/`--danger-bg #fbe9e6`.
- Sidebar del panel: fondo `--primary-dark`, texto claro, ítem activo con fondo `white/10`.

## Quién usa el sistema

- **Arrendador**: el que se registra en el sistema. Tiene una o más propiedades y quiere que sus
  inquilinos le paguen por este medio. Es quien tiene cuenta y login.
- **Inquilino**: NO tiene cuenta. Recibe un correo con la factura y un link de pago. Paga desde ahí.

## Flujo funcional paso a paso

1. El arrendador se registra e inicia sesión.
2. El arrendador registra una propiedad (dirección, tipo, cantón) y un inquilino para esa propiedad
   (nombre, correo, teléfono, monto de la renta, día de vencimiento, fechas de contrato) en un solo
   formulario con indicador de pasos.
3. Llegada la fecha de cobro, el sistema genera la factura y le manda al inquilino un correo con el
   detalle y un link de pago (transferencia bancaria, por ahora).
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
- [x] `/dashboard/ayuda`: sección para que el arrendador contacte al soporte de Rentia por WhatsApp
      (link `wa.me` con mensaje prellenado). El número vive en `src/lib/config.ts`
      (`SOPORTE_WHATSAPP_NUMERO`) — **hoy es un número de relleno (`50600000000`), falta que Thomas
      dé el número real de soporte.**
- [x] `/admin`: panel interno solo para el equipo de Rentia (no para arrendadores) — muestra el total
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
- **Programador de tareas:** Vercel Cron (recordatorios diarios) — pendiente de implementar
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
