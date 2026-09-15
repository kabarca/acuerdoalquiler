# Sistema de cobro de renta con tarjeta

## Qué es este proyecto

Un sistema para que arrendadores en Costa Rica puedan cobrarle el alquiler a sus inquilinos por
tarjeta (débito o crédito), sin que el inquilino tenga que ir al banco o hacer transferencia manual.
El arrendador registra su propiedad y su inquilino una sola vez; el sistema se encarga de mandar la
factura, cobrar el link de pago, recordar si no han pagado, y avisarle al arrendador si el inquilino
se atrasa demasiado.

Referencia directa de mercado: [Zillow Rental Manager – Collect Rent Online](https://www.zillow.com/rental-manager/collect-rent-online/).

## Quién usa el sistema

- **Arrendador**: el que se registra en el sistema. Tiene una o más propiedades y quiere que sus
  inquilinos le paguen por este medio. Es quien tiene cuenta y login.
- **Inquilino (arrendatario)**: NO tiene cuenta. Recibe un correo con la factura y un link de pago.
  Paga desde ahí, sin necesidad de crear usuario ni contraseña.

## Flujo funcional paso a paso

1. El arrendador se registra e inicia sesión.
2. El arrendador registra una propiedad (dirección) y un inquilino para esa propiedad (nombre,
   correo, teléfono, monto de la renta, fecha en que debe pagar cada mes).
3. Llegada la fecha de cobro, el sistema genera la factura y le manda al inquilino un correo con el
   detalle y un link de pago (tarjeta débito o crédito).
4. El inquilino paga desde el link, sin necesidad de cuenta.
5. Si el inquilino no ha pagado después de unos días, el sistema le manda un correo recordatorio.
6. Si sigue sin pagar después de un periodo mayor (a definir), el sistema le avisa al arrendador por
   correo para que tome acción.
7. El arrendador ve en su panel el estado de cada inquilino: pagado, pendiente, atrasado.

## Alcance del MVP (empezar por aquí)

- [ ] Registro/login de arrendadores (Supabase Auth)
- [ ] Panel del arrendador: registrar propiedad + inquilino + monto de renta (inspirado en el panel
      de Zillow Rentals que Thomas compartió como referencia de diseño — pestañas Overview / Leases /
      Payments, tarjeta de inquilino con datos de contacto y periodo de arrendamiento)
- [ ] Generación de factura mensual y envío por correo (Resend) con link de pago
- [ ] Cobro por tarjeta vía Onvopay (débito/crédito), sin que el inquilino necesite cuenta
- [ ] Recordatorio automático si no ha pagado después de X días (cron)
- [ ] Aviso al arrendador si el inquilino se atrasa más de Y días (cron)
- [ ] Panel con estado por inquilino: pagado / pendiente / atrasado

## Fase 2 (con arrendadores reales usando el sistema)

- [ ] Historial de pagos y recibos descargables
- [ ] Reintento de cobro / actualizar tarjeta guardada
- [ ] Reportes mensuales por email al arrendador
- [ ] Múltiples propiedades por arrendador con vista consolidada
- [ ] Modelo de cobro del sistema (suscripción o comisión por transacción — Thomas aún no decide,
      ver "Decisiones pendientes")

## Diseño (referencia visual que compartió Thomas)

- Estética general limpia tipo fintech (referencia: app de Bilt).
- El flujo de "registrar inquilino" del panel del arrendador debe inspirarse en el panel de
  Zillow Rentals: tarjeta de inquilino con nombre, correo, teléfono, periodo de arrendamiento
  (fecha inicio/fin, estado), y sección de "próximos pasos" (ej. subir contrato).

## Procesador de pagos: Onvopay

Stripe no opera cuentas de comercio en Costa Rica (no puede liquidar a bancos costarricenses), así
que el cobro se hace con **Onvopay**, fintech costarricense con API REST moderna (llaves de
prueba/producción, publishable/secret key, webhooks) — ver `docs.onvopay.com`. Comisión aproximada:
3.9% + $0.25 por cobro con tarjeta (verificar tarifa vigente antes de lanzar). Thomas todavía no
tiene cuenta creada — hay que crearla antes de poder cobrar de verdad; mientras tanto se construye
contra el modo de pruebas (test keys).

## Stack técnico

Mismo stack que el proyecto de Restauración Láser de Thomas, para no mezclar tecnologías — pero en
un repositorio y proyecto totalmente separados, sin dependencias entre ambos:

- **Frontend/Backend:** Next.js 15 (App Router), TypeScript
- **Base de datos:** Supabase (Postgres + Auth)
- **ORM:** Prisma
- **Correo:** Resend (factura, recordatorio, aviso al arrendador)
- **Cobro con tarjeta:** Onvopay
- **Programador de tareas:** Vercel Cron (recordatorios diarios)
- **Hosting:** Vercel

## Privacidad y datos

- El inquilino no crea cuenta — sus datos los ingresa el arrendador. Hay que ser claro en el correo
  de factura sobre quién le está cobrando y por qué tiene sus datos.
- Datos de tarjeta nunca tocan el servidor propio — se manejan siempre a través del checkout/SDK de
  Onvopay (tokenización), nunca se guardan en la base de datos propia.

## Decisiones pendientes de Thomas (preguntar antes de asumir)

- Modelo de cobro del sistema: ¿suscripción al arrendador, comisión por transacción, o ninguna por
  ahora? (respondió "aún no lo sé, decidir después")
- Después cuántos días sin pagar se manda el recordatorio al inquilino, y después de cuántos días
  más se le avisa al arrendador.
- Si el arrendador puede tener más de una propiedad/inquilino desde el MVP o si empezamos con uno
  solo por simplicidad.
