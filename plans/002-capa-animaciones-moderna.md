# Plan 002: Capa de animaciones moderna (patrones 21st.dev portados a CSS/vanilla)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat eb6d7af..HEAD -- index.html secciones/ assets/css/tailwind-src.css assets/js/script.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plan 001 (ya mergeado a main en `eb6d7af` — solo verificá el drift check)
- **Category**: direction (mejora visual solicitada por el usuario)
- **Planned at**: commit `eb6d7af`, 2026-07-06

## Why this matters

El usuario pidió que la página se vea "lo más moderna posible" con tantas
animaciones como se pueda **sin excesos**, inspiradas en los componentes de
21st.dev. Esos componentes son React/shadcn y este sitio es estático (HTML +
Tailwind compilado + vanilla JS, sin build en deploy), así que este plan porta
sus *patrones* a CSS puro + JS mínimo: entrada cinematográfica del hero,
spotlight que sigue el mouse en las cards (patrón "Magic Card"), contadores
animados en el mockup de BiFrost, acordeón FAQ suave, brillo (sheen) en CTAs,
micro-interacción de iconos, pulso del botón de WhatsApp y barra de progreso
de scroll. Todo respeta `prefers-reduced-motion`.

## Current state

Archivos relevantes:

- `assets/css/tailwind-src.css` — fuente de estilos. Los bloques de CSS crudo
  al final (fuera de `@layer`) pasan tal cual al output compilado. Termina hoy
  (líneas 152–158) con este guard, **después del cual vas a agregar todo el CSS
  nuevo, reubicando el guard al final**:

  ```css
  /* ── Respetar reduced-motion en todo lo nuevo ─────────── */
  @media (prefers-reduced-motion: reduce) {
    [data-menu-toggle] span,
    [data-menu],
    .nav-link::after,
    header#top { transition: none; }
  }
  ```

- `assets/js/script.js` — vanilla JS, sin módulos, `const` + arrow functions,
  comentarios de sección con `// ── título ──`. El reveal al scroll ya existe
  (líneas 27–48): agrega `.reveal-ready` al body, observa `[data-reveal]` y
  les pone `.is-in`. **No lo modifiques**; los efectos nuevos van en bloques
  nuevos al final del archivo (antes del bloque del formulario está bien
  también, pero el final es más simple).

- `index.html` — home. Puntos que vas a tocar:
  - Línea 145, contenedor del hero:
    ```html
    <div class="parallax-layer relative z-10 max-w-4xl text-center" data-speed="0.02" data-reveal>
    ```
  - Líneas 284–297, KPIs del mockup BiFrost (los tres `<p class="text-lg font-bold ...">` con `$1.2M`, `34%`, `$12.4k`).
  - Líneas 298–306, gráfico de barras del mockup: 7 `<div class="w-full rounded-t bg-violet-accent/60" style="height:NN%"></div>` dentro de un contenedor `flex h-40 ... items-end`.
  - El mockup completo está envuelto en `<div class="relative" data-reveal>` (línea 277).
  - Sección FAQ (`id="faq"`, líneas 316–362): seis `<details class="glass group rounded-lg p-6" data-reveal>`.
  - Header CTA "Pedir propuesta" (líneas 109–113), CTA principal del hero (líneas 154–157), botón submit del formulario (línea 433).
- `secciones/servicios.html`, `secciones/nosotros.html`, `secciones/contacto.html` —
  las tres tienen el mismo hero en la línea 70–76:
  ```html
  <section class="px-5 pb-16 pt-16 md:px-margin-page">
    <div class="mx-auto max-w-container" data-reveal>
      <span class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-accent">...</span>
      <h1 class="mt-4 max-w-3xl font-garamond text-5xl ...">...</h1>
      <p class="mt-5 max-w-2xl text-lg ...">...</p>
    </div>
  </section>
  ```
  y el mismo header con el CTA "Pedir propuesta" del panel mobile (línea 63) y
  el desktop (buscá `rounded-[100px] bg-violet-accent px-5 py-2.5`).

Convenciones que DEBÉS respetar:

- Curva de easing del sitio: `cubic-bezier(0.23, 1, 0.32, 1)` — usala en toda
  transición/animación nueva (ver `.glass-card` en `tailwind-src.css:83-85`).
- Paleta: `#c5c0ff` (violet-accent), `#9d85ff` (cool-violet), `#f2994a` (ember),
  fondo `#0a0a0a` (ink).
- Los radios arbitrarios (`rounded-[100px]`, `rounded-[12px]`) son intencionales — no los cambies.
- Todo efecto con movimiento se apaga bajo `prefers-reduced-motion: reduce`.
- Tras editar HTML/JS hay que compilar y **commitear** `assets/css/tailwind.css`
  (se sirve sin build en Cloudflare Pages).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Compilar CSS | `npm run build` | exit 0, "Done in NNNms" |
| Verificar output | `grep -c "<patrón>" assets/css/tailwind.css` | según cada paso |

No hay test suite ni typecheck; la verificación es grep sobre el CSS compilado
+ checklist manual en navegador (paso final).

**Cuidado con `grep -c` en cadenas `&&`**: devuelve exit 1 cuando el conteo es
0 y corta la cadena. Encadená greps con `;`, no con `&&`.

## Scope

**In scope** (únicos archivos que podés modificar):
- `assets/css/tailwind-src.css`
- `assets/css/tailwind.css` (solo vía `npm run build`, nunca a mano)
- `assets/js/script.js`
- `index.html`
- `secciones/servicios.html`
- `secciones/nosotros.html`
- `secciones/contacto.html`

**Out of scope** (NO tocar aunque parezca relacionado):
- `assets/js/hero-fx.js` — el shader aurora y el dot-grid ya están hechos.
- El bloque del menú mobile / hamburguesa en CSS y JS — recién entregado (plan 001).
- El `access_key` de Web3Forms y toda la lógica del formulario en `script.js` (líneas 50–135).
- `tailwind.config.js`, `package.json`.
- Cualquier dependencia nueva o librería de animación: **prohibido**. Todo es CSS + vanilla JS.

## Git workflow

- Branch: `advisor/002-capa-animaciones` (desde `main`).
- Un commit por paso o unidad lógica; mensajes en español, imperativos y cortos
  (ejemplo del historial: "Navbar mobile animada + micro-animaciones Aurora").
- Incluí `assets/css/tailwind.css` compilado en el commit final.
- NO pushear ni abrir PR.

## Steps

### Step 1: Agregar los bloques CSS nuevos a `tailwind-src.css`

Insertá los bloques siguientes **inmediatamente antes** del bloque
`/* ── Respetar reduced-motion en todo lo nuevo ─── */` (líneas 152–158), y
después **reemplazá ese guard** por la versión ampliada que está al final de
este paso.

```css
/* ── Hero: entrada cinematográfica escalonada (al cargar) ── */
@keyframes kreta-hero-rise {
  from { opacity: 0; transform: translateY(24px); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: none; }
}
[data-hero] > * {
  animation: kreta-hero-rise 0.9s cubic-bezier(0.23, 1, 0.32, 1) both;
}
[data-hero] > *:nth-child(2) { animation-delay: 0.12s; }
[data-hero] > *:nth-child(3) { animation-delay: 0.24s; }
[data-hero] > *:nth-child(4) { animation-delay: 0.36s; }

/* ── Spotlight en glass-cards (sigue el mouse; JS setea --spot-x/y) ── */
@media (hover: hover) and (pointer: fine) {
  .glass-card {
    position: relative;
    overflow: hidden;
  }
  .glass-card::after {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    background: radial-gradient(
      240px circle at var(--spot-x, 50%) var(--spot-y, 50%),
      rgba(197, 192, 255, 0.1),
      transparent 65%
    );
    transition: opacity 0.4s ease;
  }
  .glass-card:hover::after { opacity: 1; }
}

/* ── Iconos de las cards: pop sutil en hover ── */
.glass-card .material-symbols-outlined {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.glass-card:hover .material-symbols-outlined {
  transform: scale(1.12) rotate(-4deg);
}

/* ── Barras del mockup BiFrost: crecen al revelarse ── */
.reveal-ready .chart-bar {
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}
.reveal-ready [data-reveal].is-in .chart-bar { transform: scaleY(1); }
/* ponytail: delays fijos nth-child; las barras no tienen hover, no contaminan nada */
.reveal-ready [data-reveal].is-in .chart-bar:nth-child(2) { transition-delay: 0.06s; }
.reveal-ready [data-reveal].is-in .chart-bar:nth-child(3) { transition-delay: 0.12s; }
.reveal-ready [data-reveal].is-in .chart-bar:nth-child(4) { transition-delay: 0.18s; }
.reveal-ready [data-reveal].is-in .chart-bar:nth-child(5) { transition-delay: 0.24s; }
.reveal-ready [data-reveal].is-in .chart-bar:nth-child(6) { transition-delay: 0.3s; }
.reveal-ready [data-reveal].is-in .chart-bar:nth-child(7) { transition-delay: 0.36s; }

/* ── FAQ: acordeón suave (progressive enhancement, Chrome/Edge 131+) ──
   Firefox/Safari ignoran ::details-content o interpolate-size y abren
   instantáneo, que es el comportamiento actual. */
#faq details { interpolate-size: allow-keywords; }
#faq details::details-content {
  opacity: 0;
  block-size: 0;
  overflow: hidden;
  transition: block-size 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease,
    content-visibility 0.4s allow-discrete;
}
#faq details[open]::details-content {
  opacity: 1;
  block-size: auto;
}

/* ── CTAs primarios: barrido de brillo (sheen) en hover ── */
.btn-sheen {
  position: relative;
  overflow: hidden;
}
.btn-sheen::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -75%;
  width: 50%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.btn-sheen:hover::before { left: 125%; }

/* ── Botón flotante de WhatsApp: pulso ocasional ──
   El primer valor replica la sombra Tailwind existente (shadow-2xl
   shadow-violet-accent/20) para no perderla al animar box-shadow. */
@keyframes kreta-wa-pulse {
  0%, 100% { box-shadow: 0 25px 50px -12px rgba(197, 192, 255, 0.2), 0 0 0 0 rgba(197, 192, 255, 0.35); }
  50% { box-shadow: 0 25px 50px -12px rgba(197, 192, 255, 0.2), 0 0 0 10px rgba(197, 192, 255, 0); }
}
a[aria-label="Hablar por WhatsApp"] {
  animation: kreta-wa-pulse 4s cubic-bezier(0.23, 1, 0.32, 1) infinite;
}

/* ── Barra de progreso de scroll (JS setea el scaleX) ── */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60; /* header z-40, WhatsApp z-50 */
  height: 2px;
  width: 100%;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, #9d85ff, #c5c0ff, #f2994a);
}
```

Reemplazá el guard final por:

```css
/* ── Respetar reduced-motion en todo lo nuevo ─────────── */
@media (prefers-reduced-motion: reduce) {
  [data-menu-toggle] span,
  [data-menu],
  .nav-link::after,
  header#top { transition: none; }
  [data-hero] > *,
  a[aria-label="Hablar por WhatsApp"] { animation: none; }
  .reveal-ready .chart-bar { transform: none; transition: none; }
  #faq details::details-content { transition: none; }
}
```

(La barra de progreso y el spotlight quedan fuera del guard a propósito: son
feedback de posición y un fade de opacidad, no movimiento.)

**Verify**: `npm run build` → exit 0. Después (greps separados, no `&&`):
`grep -c "kreta-hero-rise" assets/css/tailwind.css` → `2` (el `@keyframes` + su uso en `[data-hero] > *`);
`grep -c "spot-x" assets/css/tailwind.css` → `1` (la línea del radial-gradient con `var(--spot-x, ...)`);
`grep -c "kreta-wa-pulse" assets/css/tailwind.css` → `2`.

### Step 2: JS — spotlight, contadores y barra de progreso en `script.js`

Agregá al **final** de `assets/js/script.js` estos tres bloques, respetando el
estilo (comentarios `// ── ──`, `const`, arrow functions):

```js
// ── Spotlight en glass-cards: la luz sigue el mouse ──
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target.closest(".glass-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", e.clientX - r.left + "px");
      card.style.setProperty("--spot-y", e.clientY - r.top + "px");
    },
    { passive: true }
  );
}

// ── Contadores animados (KPIs del mockup BiFrost) ──
const counters = document.querySelectorAll("[data-count]");
if (counters.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        const el = entry.target;
        const to = parseFloat(el.dataset.countTo);
        const decimals = parseInt(el.dataset.countDecimals || "0", 10);
        const prefix = el.dataset.countPrefix || "";
        const suffix = el.dataset.countSuffix || "";
        const start = performance.now();
        const duration = 1200;
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          el.textContent = prefix + (to * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => countObserver.observe(el));
}

// ── Barra de progreso de scroll ──
const progressBar = document.querySelector(".scroll-progress");
if (progressBar) {
  const onProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  };
  onProgress();
  window.addEventListener("scroll", onProgress, { passive: true });
}
```

No toques el bloque del reveal (líneas 27–48) ni el del formulario (50–135).

**Verify**: `node --check assets/js/script.js` → exit 0, sin output.

### Step 3: HTML — hero escalonado en las 4 páginas

1. `index.html:145` — en el contenedor del hero, reemplazá `data-reveal` por
   `data-hero` (mantené `parallax-layer`, `data-speed` y el resto igual):
   ```html
   <div class="parallax-layer relative z-10 max-w-4xl text-center" data-speed="0.02" data-hero>
   ```
2. En `secciones/servicios.html:71`, `secciones/nosotros.html:71` y
   `secciones/contacto.html:71`, mismo cambio:
   ```html
   <div class="mx-auto max-w-container" data-hero>
   ```

Razón: si quedara `data-reveal`, el hero animaría dos veces (reveal + entrada).

**Verify**:
`grep -c "data-hero" index.html secciones/servicios.html secciones/nosotros.html secciones/contacto.html` → `1` en cada archivo;
`grep -n "data-speed=\"0.02\" data-reveal" index.html` → sin matches.

### Step 4: HTML — contadores y barras en `index.html`

1. Líneas 284–297, agregá los data-attributes a los tres KPIs (el texto actual
   queda como fallback sin JS):
   ```html
   <p class="text-lg font-bold text-violet-accent" data-count data-count-to="1.2" data-count-decimals="1" data-count-prefix="$" data-count-suffix="M">$1.2M</p>
   ```
   ```html
   <p class="text-lg font-bold text-ember" data-count data-count-to="34" data-count-suffix="%">34%</p>
   ```
   ```html
   <p class="text-lg font-bold text-cool-violet" data-count data-count-to="12.4" data-count-decimals="1" data-count-prefix="$" data-count-suffix="k">$12.4k</p>
   ```
2. Líneas 298–306, agregá la clase `chart-bar` a cada una de las 7 barras:
   ```html
   <div class="chart-bar w-full rounded-t bg-violet-accent/60" style="height:40%"></div>
   ```
   (misma edición en las 7, conservando cada `height` inline).

**Verify**: `grep -c "data-count-to" index.html` → `3`; `grep -c "chart-bar" index.html` → `7`.

### Step 5: HTML — clase `btn-sheen` en CTAs primarios y barra de progreso

1. Agregá la clase `btn-sheen` (como primera clase del atributo) a estos elementos:
   - `index.html:109-113` — CTA "Pedir propuesta" del header desktop.
   - `index.html:154-157` — CTA "Pedir propuesta" del hero (el que tiene `inner-glow-top`).
   - `index.html:433` — botón submit "Quiero recibir una propuesta".
   - En las 3 páginas de `secciones/` — el CTA "Pedir propuesta" del header
     desktop (buscá `rounded-[100px] bg-violet-accent px-5 py-2.5 text-xs font-semibold text-on-violet` en un `<a>` con clase `hidden ... md:inline-flex`).
   - `secciones/contacto.html` — el botón submit del formulario (`button` con `type="submit"` y `bg-violet-accent`).

   No lo agregues al CTA del panel mobile ni al botón flotante de WhatsApp
   (ya tiene su pulso).

2. Inmediatamente después de `<body ...>` en las 4 páginas, agregá:
   ```html
   <div class="scroll-progress" aria-hidden="true"></div>
   ```

**Verify**:
`grep -c "btn-sheen" index.html` → `3`;
`grep -c "btn-sheen" secciones/servicios.html secciones/nosotros.html secciones/contacto.html` → `1`, `1`, `2`;
`grep -c "scroll-progress" index.html secciones/servicios.html secciones/nosotros.html secciones/contacto.html` → `1` en cada uno.

### Step 6: Compilar y commitear

`npm run build` y commit final incluyendo `assets/css/tailwind.css`.

**Verify**: `npm run build` → exit 0. Luego (greps separados, no `&&`):
`grep -c "btn-sheen" assets/css/tailwind.css` → ≥ 2;
`grep -c "scroll-progress" assets/css/tailwind.css` → ≥ 1;
`grep -c "chart-bar" assets/css/tailwind.css` → ≥ 8;
`git status --short` → solo archivos in-scope modificados.

### Step 7: Checklist manual en navegador

Abrí `index.html` en un navegador (Chrome preferentemente) y verificá:

- [ ] Al cargar, el hero entra escalonado (eyebrow → h1 → párrafo → CTAs) con blur que se disuelve; nada "salta" dos veces.
- [ ] La barra fina de progreso (arriba de todo) crece al scrollear.
- [ ] Al pasar el mouse sobre cualquier `glass-card`, un halo violeta sigue el cursor y el icono hace un pop sutil.
- [ ] En la sección BiFrost, al entrar al viewport: los KPIs cuentan desde 0 hasta `$1.2M`, `34%`, `$12.4k` y las barras del gráfico crecen escalonadas desde abajo.
- [ ] El FAQ abre/cierra suave (en Chrome/Edge; en Firefox abre instantáneo y eso es correcto).
- [ ] Los CTAs "Pedir propuesta" y el submit muestran un barrido de brillo en hover.
- [ ] El botón de WhatsApp pulsa suavemente cada ~4s.
- [ ] En `secciones/servicios.html`, `nosotros.html` y `contacto.html`: hero escalonado, barra de progreso, sheen en el CTA del header.
- [ ] Con "Reducir movimiento" activado en el SO: sin animación de hero, sin pulso de WhatsApp, barras del chart visibles de entrada, contadores estáticos.
- [ ] En mobile (DevTools < 768px): sin spotlight (no hay hover), todo lo demás funciona y el menú hamburguesa sigue intacto.

## Test plan

No hay test suite (sitio estático). La verificación es: greps de los pasos 1–6
sobre los archivos fuente y el CSS compilado + el checklist manual del paso 7.
El checklist completo cuenta como "tests passing".

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run build` exit 0 y `assets/css/tailwind.css` commiteado.
- [ ] `node --check assets/js/script.js` exit 0.
- [ ] `grep -c "data-hero" index.html` → 1 y `grep -rc "data-hero" secciones/` → 1 por archivo.
- [ ] `grep -c "data-count-to" index.html` → 3; `grep -c "chart-bar" index.html` → 7.
- [ ] `grep -c "scroll-progress" index.html` → 1 (ídem en las 3 secciones).
- [ ] `grep -c "kreta-hero-rise" assets/css/tailwind.css` ≥ 2; `grep -c "kreta-wa-pulse" assets/css/tailwind.css` ≥ 2.
- [ ] `git status --short` no muestra archivos fuera del scope.
- [ ] Checklist del paso 7 completado.
- [ ] Fila de este plan actualizada en `plans/README.md`.

## STOP conditions

Stop and report back (do not improvise) if:

- El drift check muestra cambios en archivos in-scope y los extractos de
  "Current state" no coinciden con el código vivo.
- `npm run build` falla dos veces tras un intento razonable de arreglo.
- El contenedor del hero de alguna página no coincide con el extracto (p.ej.
  ya no tiene `data-reveal`, o el de index perdió `parallax-layer`).
- El mockup BiFrost no tiene exactamente 3 KPIs y 7 barras como en los extractos.
- Algún efecto exige tocar `hero-fx.js`, `tailwind.config.js` o agregar una
  dependencia — todo eso está fuera de scope.

## Maintenance notes

- **Spotlight**: usa `overflow: hidden` en `.glass-card` (solo bajo
  `hover+pointer:fine`); si a futuro una card necesita contenido que sobresalga
  (tooltip, badge flotante), ese overflow lo va a recortar en desktop.
- **`[data-hero]` cuenta hijos directos**: si se agrega un quinto hijo al hero,
  hay que sumar su `nth-child(5)` con delay 0.48s.
- **Contadores**: el texto inicial del HTML es el fallback sin JS; si cambian
  los valores del mockup hay que actualizar texto Y `data-count-to`.
- **FAQ suave** depende de `interpolate-size`/`::details-content` (Chrome/Edge
  131+); es enhancement puro, no requiere seguimiento.
- Revisar en el PR: que el hero de index no anime doble (data-reveal fuera),
  y que el sheen no aparezca en elementos no interactivos.
- Deferido a propósito: tilt 3D en cards, shimmer de gradiente en el h1
  (pelea con la elegancia del Garamond), marquee de logos (no hay logos de
  clientes aún), efectos typewriter/scramble (no matchean el tono editorial).
