# 010 — Cloudflare Web Analytics

**Priority:** P2 · **Effort:** S · **Risk:** LOW · **Depends on:** —
**Status: RESUELTO SIN CÓDIGO** (2026-07-09). No hay cambios que ejecutar en este repo.

## Problema

El sitio tenía **cero telemetría**. Hay tres CTAs distintos y ninguno instrumentado:

- WhatsApp flotante — `index.html:103`
- WhatsApp del hero — `index.html:127`
- Submit del formulario de contacto — `index.html:456` / `secciones/contacto.html:178`

No se podía saber cuál convierte. (Síntoma: se armó una encuesta de Google Forms
a mano justamente para suplir esta falta de datos.)

Cloudflare Web Analytics es la opción natural: el sitio ya se sirve con Cloudflare
Workers Static Assets, el beacon **no usa cookies ni fingerprinting** → no requiere
banner de consentimiento, y es gratis.

## Decisión: instalación automática, no snippet

El dominio ya pasa por la red de Cloudflare, así que el beacon se inyecta del lado
del servidor en las respuestas HTML. **No se toca el repo.**

Dashboard → Web Analytics → el sitio → **"Habilitar automáticamente"**
(en vez de "Habilitar con la instalación del snippet JS").

Por qué esta opción y no pegar el `<script>` en los 4 `<head>`:

- Cero diff, cero riesgo de romper el deploy, cero duplicación en 4 archivos.
- Se apaga o se rota desde el dashboard sin necesidad de un commit.
- Contra asumida: la instalación es invisible para quien lea el repo. Esta nota
  existe justamente para compensar eso.

El token del beacon (público por diseño: viajaría en el HTML servido) queda solo
en el dashboard de Cloudflare. No está versionado en este repo.

Nota sobre el snippet, por si algún día hace falta volver a él: Cloudflare lo
entrega con `type='module'`, que **ya es diferido por defecto**. Agregarle `defer`
es redundante.

## Qué da y qué no

**Da:** pageviews, referrers, países, dispositivos/navegadores y Core Web Vitals
por página. Desde cero telemetría, es el salto grande.

**No da:** eventos custom. El plan gratuito no los expone.

## Considered and rejected — eventos por CTA

- **Hashes de URL vía `history.replaceState`** (idea original de este plan):
  **no funciona.** `replaceState` no dispara ningún reporte del beacon, y
  Cloudflare Web Analytics no cuenta navegaciones de history API como pageviews.
  Habría dado la ilusión de telemetría sin datos reales.
- **Endpoint propio (Worker + almacenamiento)**: daría eventos atribuibles por
  CTA, pero es un servicio nuevo que mantener. Desproporcionado hoy.
- **GA4 en paralelo**: sí tiene eventos custom gratis, pero usa cookies → exige
  banner de consentimiento y pesa bastante más. Contradice la razón por la que se
  eligió Cloudflare.

**Cuándo revisarlo:** cuando los pageviews muestren que alguna página convierte
mal y haga falta saber cuál de los 3 CTAs falla. Antes de eso, es instrumentación
sin pregunta que responder.
