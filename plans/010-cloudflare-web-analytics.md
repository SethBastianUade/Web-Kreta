# 010 — Cloudflare Web Analytics + instrumentación de los 3 CTAs

**Priority:** P2 · **Effort:** S · **Risk:** LOW · **Depends on:** —
**Status: BLOQUEADO** hasta que el usuario provea el token del beacon.

## Problema

El sitio tiene **cero telemetría**. Hay tres CTAs distintos y ninguno está
instrumentado:

- WhatsApp flotante — `index.html:103`
- WhatsApp del hero — `index.html:127`
- Submit del formulario de contacto — `index.html:456` / `secciones/contacto.html:178`

No se puede saber cuál convierte. (Síntoma: el usuario armó una encuesta de
Google Forms a mano justamente para suplir esta falta de datos.)

Cloudflare Web Analytics es la opción natural: el sitio ya está en Cloudflare
Pages, el beacon **no usa cookies ni fingerprinting** → no requiere banner de
consentimiento, y es gratis.

---

## ⛔ Dependencia dura: el token del beacon

El beacon necesita un token que genera **el usuario** en su dashboard de
Cloudflare (Analytics & Logs → Web Analytics → Add a site → copiar el token del
snippet).

**El executor NO debe inventar, adivinar ni usar un token de ejemplo.**
Si el token no está provisto en el prompt de la tarea:

> **STOP inmediato.** Reportá: "Falta el token del beacon de Cloudflare Web
> Analytics. Obtenelo en el dashboard de Cloudflare y volvé a lanzar el plan con
> el token." No escribas ningún archivo.

El token no es un secreto (viaja en el HTML público del sitio), pero un token
inventado rompe el beacon en silencio.

---

## Step 1 — Beacon en las 4 páginas

Insertá, como **última línea antes de `</body>`** en `index.html` y en las 3
subpáginas de `secciones/`:

```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "TOKEN_AQUI"}'></script>
```

`defer` para que no bloquee el render. Reemplazá `TOKEN_AQUI` por el token real.

---

## Step 2 — Eventos en los 3 CTAs

Cloudflare Web Analytics expone `window.__cfBeacon` pero **no** una API de
eventos custom estable en el plan gratuito. Para no depender de eso, usá
`data-*` + un handler propio que registre el click como una navegación virtual,
que es lo que el beacon sí cuenta.

Enfoque mínimo y honesto: agregá al final de `assets/js/script.js`:

```js
// ── Telemetría de CTAs (Cloudflare Web Analytics cuenta pageviews) ──
// ponytail: sin API de eventos custom en el plan free; usamos hashes de URL,
// que el beacon registra como vistas. Subir a un endpoint propio si hace falta más.
document.querySelectorAll("[data-cta]").forEach((el) => {
  el.addEventListener("click", () => {
    try {
      history.replaceState(null, "", "#cta-" + el.dataset.cta);
    } catch (_) {}
  });
});
```

Y marcá los 3 CTAs con el atributo:

- `index.html:103` (WhatsApp flotante) → agregá `data-cta="whatsapp-float"`
- `index.html:127` (WhatsApp del hero) → agregá `data-cta="whatsapp-hero"`
- Los `<form class="contact-form">` de `index.html` y `secciones/contacto.html`
  → agregá `data-cta="form-submit"` **al botón submit** de cada uno.

`data-cta` no es una clase de Tailwind, así que **este step no requiere build**.
Pero el Step 3 sí puede requerirlo si tocás clases; no deberías.

> Si preferís no ensuciar la URL con hashes, la alternativa es aceptar que el
> plan free no da eventos custom y limitarse al Step 1 (pageviews + referrers +
> Core Web Vitals, que ya es un salto enorme respecto de cero). **Decidilo con
> el usuario, no por tu cuenta.** Si hay duda, hacé **solo el Step 1**.

---

## Done criteria

1. `grep -c 'cloudflareinsights.com/beacon' index.html secciones/*.html` → 1 en
   cada uno de los 4.
2. En los 4, el `<script>` del beacon está antes de `</body>` y tiene `defer`.
3. `grep -c 'TOKEN_AQUI' index.html secciones/*.html` → **0 en los 4** (o sea:
   el placeholder fue reemplazado).
4. Si se hizo el Step 2: `node --check assets/js/script.js` → exit 0, y
   `grep -c 'data-cta' index.html secciones/contacto.html` → ≥1 en cada uno.
5. No se modificó `tailwind.config.js` ni `assets/css/tailwind.css`.

## STOP conditions

- Sin token → parar antes de escribir nada (ver arriba).
- Duda sobre el Step 2 → hacer solo el Step 1 y reportar.

## Commit

```
feat: Cloudflare Web Analytics (cookieless) en las 4 paginas
```
