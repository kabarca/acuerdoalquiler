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

## Ya construido (reconstruido 2026-09-15/17 sobre las 24 pantallas del artifact)

Landing, cuenta y panel principal:
- [x] Landing pública con hero, "cómo funciona", beneficios y CTA (`Main`)
- [x] Registro/login de arrendadores (Supabase Auth) con panel de marca a la izquierda (`Register`)
- [x] Panel (`/dashboard`): tarjetas de resumen (cobrado, pendientes, vencidos) + tabla combinada (`Dashboard`)
- [x] Propiedades en tarjetas (`/dashboard/propiedades`) con tipo, cantón, inquilino, badge de estado (`Properties`)
- [x] Alta combinada de propiedad + inquilino + condiciones de pago en un solo formulario
      (`/dashboard/propiedades/nueva`, `AddProperty`)
- [x] Detalle de propiedad: tarjeta de inquilino + historial de pagos (`/dashboard/propiedades/[id]`, `PropertyDetail`)
- [x] Configuración: datos de cuenta, cuenta bancaria (para transferencias), estado de integraciones

Cobro e invitación al inquilino:
- [x] Página pública de pago (`/pagar/[facturaId]`, `PaymentPage`) con pestañas transferencia/débito/crédito,
      estados PAGADA / EN_REVISION / pendiente
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
  más se abre la disputa / se le avisa al arrendador (el cron todavía no está implementado — hoy son
  botones manuales de prueba: "Marcar como vencida" y "Abrir disputa").
- Si el pago por transferencia bancaria debe seguir ofreciéndose junto a tarjeta, o solo mientras
  Onvopay no esté conectado.

## Credenciales de prueba (solo para desarrollo local)

Cuenta de arrendador creada directamente en Supabase Auth (ya confirmada, sin pasar por el flujo de
registro) para poder probar el sistema sin cuentas reales:

- Correo: `arrendador@prueba.local`
- Contraseña: `Prueba1234!`

## Git

El proyecto es un repositorio git local (`git init` hecho el 2026-09-15, no hay remoto configurado
todavía). Hay un commit de respaldo justo antes del rediseño completo por si algo necesita
recuperarse: `git log --oneline`.
