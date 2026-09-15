# Rentia — cobro de arriendo con tarjeta

## Qué es este proyecto

Un sistema para que arrendadores en Costa Rica puedan cobrarle el arriendo a sus inquilinos por
tarjeta (débito o crédito), sin que el inquilino tenga que ir al banco o hacer transferencia manual.
El arrendador registra su propiedad y su inquilino una sola vez; el sistema se encarga de mandar la
factura, cobrar el link de pago, recordar si no han pagado, y avisarle al arrendador si el inquilino
se atrasa demasiado.

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
   detalle y un link de pago (tarjeta débito o crédito).
4. El inquilino paga desde el link, sin necesidad de cuenta.
5. Si el inquilino no ha pagado después de unos días, el sistema le manda un correo recordatorio.
6. Si sigue sin pagar después de un periodo mayor (a definir), el sistema le avisa al arrendador por
   correo para que tome acción.
7. El arrendador ve en su panel (barra lateral: Panel / Propiedades / Inquilinos / Pagos /
   Configuración) el estado de cada inquilino: pagado, pendiente, atrasado.

## Ya construido (reconstruido 2026-09-17 sobre el diseño del artifact)

- [x] Landing pública con hero, "cómo funciona", beneficios y CTA
- [x] Registro/login de arrendadores (Supabase Auth) con panel de marca a la izquierda
- [x] Panel (`/dashboard`): tarjetas de resumen (cobrado, pendientes, vencidos) + tabla combinada
- [x] Propiedades en tarjetas (`/dashboard/propiedades`) con tipo, cantón, inquilino, badge de estado
- [x] Alta combinada de propiedad + inquilino + condiciones de pago en un solo formulario
      (`/dashboard/propiedades/nueva`)
- [x] Detalle de propiedad: tarjeta de inquilino + historial de pagos (`/dashboard/propiedades/[id]`)
- [x] Páginas simples de Inquilinos y Pagos (listas across todas las propiedades) y Configuración
      (estado de las integraciones)
- [x] Página pública de pago para el inquilino (`/pagar/[facturaId]`), con estado "ya pagada"
- [x] Generación manual de factura (botón "Generar factura") para probar el flujo sin esperar el cron
- [x] Correos con el mismo lenguaje visual: factura, recordatorio, aviso al arrendador (`lib/resend.ts`)

## Pendiente del artifact (Fase 2 — NO construido todavía, confirmar con Thomas antes de empezar)

El artifact tiene 24 pantallas; estas 8 amplían bastante el producto (screening/reputación de
inquilinos, disputas, pago por transferencia con confirmación manual) y no estaban en el alcance
original de este documento — preguntar a Thomas si las quiere ahora o después:

- [ ] `TenantSearch` / `TenantProfile` — buscar inquilino y ver su "reputación" (historial de pago
      entre propiedades, posiblemente cross-arrendador — implica modelo de datos nuevo)
- [ ] `DisputeNotification` / `MarkDelinquent` / `GrantExtension` / `DisputeResolved` — flujo de
      disputa cuando el inquilino reclama un cobro (marcar moroso, otorgar prórroga, resolver)
- [ ] `RemoveTenantFeedback` — encuesta al quitar un inquilino
- [ ] `PaymentTransfer` / `TransferPending` / `LandlordConfirmPayment` — pago por transferencia
      bancaria con comprobante adjunto y confirmación manual del arrendador (alternativa a tarjeta)
- [ ] `InviteTenant` / `TenantOnboarding` — invitar al inquilino a configurar su propio método de
      pago guardado (en vez de que el arrendador registre todo)
- [ ] Pago automático recurrente (toggle "Activar pago automático" visto en `PaymentPage`) — cobra
      solo cada mes sin que el inquilino vuelva a pagar manualmente

Los archivos fuente de las 24 pantallas están extraídos en `/tmp/rentia-design/*.dc.html` (no forman
parte del repo — son solo referencia de una sesión anterior; si no existen, releer el artifact).

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
- **Programador de tareas:** Vercel Cron (recordatorios diarios) — pendiente de implementar
- **Hosting:** Vercel (pendiente desplegar)

## Privacidad y datos

- El inquilino no crea cuenta — sus datos los ingresa el arrendador. Hay que ser claro en el correo
  de factura sobre quién le está cobrando y por qué tiene sus datos.
- Datos de tarjeta nunca tocan el servidor propio — ver nota de seguridad arriba.

## Decisiones pendientes de Thomas (preguntar antes de asumir)

- Modelo de cobro del sistema: ¿suscripción al arrendador, comisión por transacción, o ninguna por
  ahora? (respondió "aún no lo sé, decidir después")
- Después de cuántos días sin pagar se manda el recordatorio al inquilino, y después de cuántos días
  más se le avisa al arrendador (el cron todavía no está implementado).
- Si construir ahora las 8 pantallas de Fase 2 del artifact (disputas, reputación, transferencia
  bancaria) o dejarlas para cuando haya arrendadores reales usando el sistema.
- Si el pago por transferencia bancaria (ACH) debe ofrecerse desde ya o solo tarjeta por ahora — el
  diseño lo muestra como opción pero no hay integración bancaria construida.

## Credenciales de prueba (solo para desarrollo local)

Cuenta de arrendador creada directamente en Supabase Auth (ya confirmada, sin pasar por el flujo de
registro) para poder probar el sistema sin cuentas reales:

- Correo: `arrendador@prueba.local`
- Contraseña: `Prueba1234!`

## Git

El proyecto es un repositorio git local (`git init` hecho el 2026-09-15, no hay remoto configurado
todavía). Hay un commit de respaldo justo antes del rediseño completo por si algo necesita
recuperarse: `git log --oneline`.
