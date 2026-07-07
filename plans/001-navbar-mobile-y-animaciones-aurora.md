# Plan 001: Navbar mobile animada y capa de micro-animaciones acordes al tema Aurora

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> Los comandos `grep` de este plan asumen Git Bash (viene con Git for Windows).
> Si usás PowerShell, corré los grep dentro de `bash -c "..."`.
>
> **Drift check (run first)**:
> `git diff --stat 6aed75b..HEAD -- index.html secciones/ assets/js/script.js assets/js/hero-fx.js assets/css/tailwind-src.css`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx / direction (UX polish)
- **Planned at**: commit `6aed75b`, 2026-07-05 (rev. 2 — corrige colapso del panel, stagger y scroll-lock de la rev. 1)

## Why this matters

El sitio ya tiene el fondo shader, dot-grid y parallax, pero la navbar mobile
abre/cierra de golpe (sin transición), la hamburguesa no se anima a "X", y el
menú abierto no bloquea el scroll del fondo. Los efectos interactivos del hero
(`dot-grid`) solo responden a `mousemove`, así que **en mobile quedan inertes**.
Falta una capa de micro-animaciones coherentes con el tema (reveal escalonado,
subrayado animado en la nav, header que se opaca al scrollear), y existe un
defecto actual: el hover de fondo/borde de las tarjetas `.glass-card` con
`data-reveal` cambia de golpe, sin transición (conflicto de especificidad CSS,
ver Step 2). Este plan agrega esa capa con el mínimo de CSS/JS, respetando
`prefers-reduced-motion`, sin tocar contenido ni SEO.

## Current state

Stack (de `AGENTS.md`): HTML + **Tailwind CSS v3 compilado** + JS vanilla, sin
frameworks. `assets/css/tailwind.css` **se commitea** (Cloudflare lo sirve
buildless); se genera desde `assets/css/tailwind-src.css` con `npm run build`.
Radios arbitrarios (`rounded-[100px]`, `rounded-[12px]`) son intencionales —
no cambiarlos. Content glob de Tailwind (`tailwind.config.js:6`):
`['./index.html', './secciones/*.html', './assets/js/*.js']` → las clases que
aparezcan como strings en el JS **sí** se escanean y compilan.

**Dato clave de box model**: el preflight de Tailwind aplica
`box-sizing: border-box` a todo. Con border-box, `max-height: 0` **no
comprime padding ni bordes** — por eso el Step 1 colapsa explícitamente
`padding` y `border-top-width` del panel mobile, no solo `max-height`.

Archivos relevantes:

- `index.html` — home. Header en líneas **97–136**; panel mobile en **126–135**.
- `secciones/servicios.html`, `secciones/nosotros.html`, `secciones/contacto.html`
  — subpáginas con **la misma estructura de header**. Diferencias vs index: el
  link activo tiene `aria-current="page"` y clases distintas
  (`text-sm font-medium text-violet-accent`, sin hover), los `href` usan `../`
  o `index.html#...`, y parte del markup está formateado en una sola línea.
  En servicios: header en línea 41, panel `[data-menu]` en línea 56,
  `<main class="pt-20">` en 68.
- `assets/js/script.js` — menú mobile (líneas 1–16), reveal al scroll (18–33),
  form Web3Forms (35–120).
- `assets/js/hero-fx.js` — shader (9–101), dot-grid (104–152), parallax (155–166).
- `assets/css/tailwind-src.css` — directivas + animaciones + `.glass`/`.glass-card`
  + reveal. Termina en la línea 95 con el cierre del `@media` de `.parallax-layer`.

### Excerpts (confirmá que el código vivo coincide antes de editar)

**Header desktop nav + panel mobile — `index.html:101-135`** (idéntico en las 4 páginas salvo `aria-current`):

```html
      <nav class="hidden items-center gap-8 md:flex" aria-label="Principal">
        <a class="text-sm text-white/60 transition-colors hover:text-violet-accent" href="secciones/servicios.html">Servicios</a>
        <a class="text-sm text-white/60 transition-colors hover:text-violet-accent" href="#bifrost">BiFrost</a>
        <a class="text-sm text-white/60 transition-colors hover:text-violet-accent" href="secciones/nosotros.html">Nosotros</a>
        <a class="text-sm text-white/60 transition-colors hover:text-violet-accent" href="#faq">FAQ</a>
        <a class="text-sm text-white/60 transition-colors hover:text-violet-accent" href="#contacto">Contacto</a>
      </nav>
      ...
      <button
        class="inline-flex flex-col gap-1.5 p-2 md:hidden"
        type="button" data-menu-toggle aria-label="Abrir menú" aria-expanded="false"
      >
        <span class="block h-px w-6 bg-white"></span>
        <span class="block h-px w-6 bg-white"></span>
        <span class="block h-px w-6 bg-white"></span>
      </button>
    </div>

    <!-- Mobile panel -->
    <div class="hidden border-t border-white/10 bg-ink/95 px-5 py-4 backdrop-blur-xl md:hidden" data-menu>
```

**Menú mobile actual — `assets/js/script.js:1-16`**:

```js
// ── Menú mobile (sin Bootstrap) ──────────────────────
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu]");
if (menuToggle && menuPanel) {
  menuToggle.addEventListener("click", () => {
    const open = menuPanel.classList.toggle("hidden") === false;
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  // Cerrar al tocar un link
  menuPanel.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menuPanel.classList.add("hidden");
      menuToggle.setAttribute("aria-expanded", "false");
    })
  );
}
```

**Reveal actual — `assets/js/script.js:18-33`**:

```js
// ── Reveal progresivo al scroll ──────────────────────
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
}
```

**Bloque reveal en CSS — `assets/css/tailwind-src.css:56-61`** (lo vas a editar en Step 2):

```css
/* Reveal progresivo al scroll (lo activa script.js con .is-in) */
.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.7s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}
```

**Dot-grid: seguimiento del mouse — `assets/js/hero-fx.js:143-149`**:

```js
    window.addEventListener("resize", init);
    // El grid no captura eventos (pointer-events:none); seguimos el mouse a nivel ventana.
    window.addEventListener("mousemove", function (e) {
      var rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
```

**Fin de `tailwind-src.css` — líneas 91-95** (vas a agregar debajo):

```css
.inner-glow-top { border-top: 1px solid rgba(255, 255, 255, 0.12); }
.parallax-layer { will-change: transform; }
@media (prefers-reduced-motion: reduce) {
  .parallax-layer { transform: none !important; }
}
```

Convención de estilo: el CSS crudo (`.glass`, `.glass-card`, keyframes) vive
**fuera de `@layer`** al final de `tailwind-src.css` y pasa tal cual al output,
**después** de las utilidades (que se emiten donde está `@tailwind utilities`,
al principio). Por eso un selector como `[data-menu]` (misma especificidad que
`.py-4`) le gana a la utilidad por orden en el archivo — es intencional, no lo
"arregles". Colores del tema: acento primario `violet-accent` = `#c5c0ff`,
fondo `ink` = `#0a0a0a`. Curva de easing usada en todo el sitio:
`cubic-bezier(0.23, 1, 0.32, 1)`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install deps (solo si `node_modules` falta) | `npm install` | exit 0 |
| Compilar CSS | `npm run build` | exit 0, regenera `assets/css/tailwind.css` |
| Preview | abrir `index.html` en un navegador | — (chequeo manual) |

No hay test suite, typecheck ni lint en este repo. La verificación es
`npm run build` + `grep` sobre el CSS compilado + el checklist manual del final.

## Scope

**In scope** (los únicos archivos que podés modificar):
- `assets/css/tailwind-src.css` (bloques nuevos al final + UNA edición al bloque reveal existente, Step 2)
- `assets/css/tailwind.css` (regenerado por `npm run build` — **no editar a mano**)
- `assets/js/script.js`
- `assets/js/hero-fx.js`
- `index.html`
- `secciones/servicios.html`
- `secciones/nosotros.html`
- `secciones/contacto.html`
- `plans/README.md` (actualizar la fila de estado al terminar)

**Out of scope** (no tocar, aunque parezca relacionado):
- `tailwind.config.js` — no hacen falta tokens nuevos; todo usa colores/clases existentes.
- El shader WebGL y el parallax de `hero-fx.js` — el parallax es mouse-only por
  diseño (necesita puntero); dejarlo así, no intentar portarlo a touch.
- Contenido, textos, meta SEO, JSON-LD, el `<form>` Web3Forms y su `access_key`.
- La sección `nosotros.html` con el equipo real — no tocar su contenido.
- Los radios arbitrarios (`rounded-[100px]`, etc.).
- El bloque `.glass-card` de `tailwind-src.css` — su conflicto de hover se
  arregla en el bloque reveal (Step 2), no tocando `.glass-card`.

## Git workflow

- Branch: `advisor/001-navbar-mobile-animaciones` (crear desde `main`).
- Un commit por fase o un único commit al final; mensaje estilo repo (ej:
  "Navbar mobile animada + micro-animaciones Aurora").
- **Commitear `assets/css/tailwind.css` regenerado** junto con el resto.
- No pushear ni abrir PR salvo que el operador lo pida.

## Steps

### Step 1: Agregar los bloques de CSS al final de `tailwind-src.css`

Pegá EXACTAMENTE este bloque después de la línea 95 (después del cierre del
`@media` de `.parallax-layer`), al final del archivo:

```css

/* ── Navbar mobile: hamburguesa → X ───────────────────── */
/* Las 3 barras son h-px (1px) con gap-1.5 (6px): centros a 7px de distancia. */
[data-menu-toggle] span {
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease;
}
[data-menu-toggle][aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
[data-menu-toggle][aria-expanded="true"] span:nth-child(2) { opacity: 0; }
[data-menu-toggle][aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Panel mobile: apertura animada (reemplaza el toggle de `hidden`) ──
   Con box-sizing:border-box, max-height:0 NO comprime padding/borde: hay que
   colapsar también py-4 (32px) y border-t (1px) o queda una franja visible. */
[data-menu] {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-top-width: 0;
  transition: max-height 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease,
    padding 0.4s cubic-bezier(0.23, 1, 0.32, 1), border-top-width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
[data-menu].is-open {
  max-height: 24rem;
  opacity: 1;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-top-width: 1px;
}

/* ── Nav desktop: subrayado animado ───────────────────── */
.nav-link { position: relative; }
.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  height: 1px;
  width: 100%;
  background: #c5c0ff;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-link:hover::after { transform: scaleX(1); transform-origin: left; }

/* ── Header: se opaca al scrollear (clase .scrolled la pone script.js) ── */
header#top { transition: background-color 0.3s ease, box-shadow 0.3s ease; }
header#top.scrolled {
  background-color: rgba(10, 10, 10, 0.7);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

/* ── Respetar reduced-motion en todo lo nuevo ─────────── */
@media (prefers-reduced-motion: reduce) {
  [data-menu-toggle] span,
  [data-menu],
  .nav-link::after,
  header#top { transition: none; }
}
```

Nota: NO hay reglas `nth-child` de stagger — el escalonado del reveal se hace
por JS en el Step 3 (un `transition-delay` fijo en CSS demoraría también el
hover de las tarjetas).

**Verify** (cada uno > 0):
- `grep -c "is-open" assets/css/tailwind-src.css` → 1
- `grep -c "nav-link" assets/css/tailwind-src.css` → ≥ 3
- `grep -c "scrolled" assets/css/tailwind-src.css` → ≥ 1
- `grep -c "border-top-width" assets/css/tailwind-src.css` → ≥ 2

### Step 2: Arreglar el hover de las cards reveladas (editar el bloque reveal existente)

**Por qué**: `.reveal-ready [data-reveal]` (especificidad 0,2,0) pisa la lista
`transition` de `.glass-card` (0,1,0). Como `transition` es una sola propiedad,
las cards con `data-reveal` pierden la transición de `background`/`border-color`
del hover: hoy cambian de golpe. Se arregla agregando esas propiedades a la
lista del bloque reveal.

En `assets/css/tailwind-src.css` (líneas 56–61, excerpt en "Current state"),
cambiá SOLO la línea de `transition` del selector `.reveal-ready [data-reveal]`:

Antes:
```css
  transition: opacity 0.7s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
```

Después:
```css
  transition: opacity 0.7s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1),
    background 0.4s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.4s cubic-bezier(0.23, 1, 0.32, 1);
```

No toques `opacity: 0;` ni `transform: translateY(18px);` ni el bloque
`@media (prefers-reduced-motion: reduce)` que le sigue.

**Verify** (los dos):
- `grep -c "border-color 0.4s" assets/css/tailwind-src.css` → **2** (una en `.glass-card`, la nueva en el bloque reveal).
- `grep -A4 '\.reveal-ready \[data-reveal\] {' assets/css/tailwind-src.css | grep -c "border-color"` → **1** (confirma que la nueva quedó DENTRO del bloque reveal, no en otro selector).

### Step 3: Reescribir menú mobile y reveal en `script.js`

**(a)** Reemplazá el bloque del menú (`script.js:1-16`, excerpt en "Current
state") por:

```js
// ── Menú mobile (sin Bootstrap): transición + scroll-lock ──
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu]");
if (menuToggle && menuPanel) {
  const setMenu = (open) => {
    menuPanel.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("overflow-hidden", open); // scroll-lock del fondo
  };
  menuToggle.addEventListener("click", () => setMenu(!menuPanel.classList.contains("is-open")));
  // Cerrar al tocar un link
  menuPanel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  // Si el viewport pasa a desktop con el menú abierto, liberar el scroll-lock
  matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });
}

// ── Header: opacar al scrollear ───────────────────────
const siteHeader = document.getElementById("top");
if (siteHeader) {
  const onHeaderScroll = () => siteHeader.classList.toggle("scrolled", window.scrollY > 10);
  onHeaderScroll();
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
}
```

**(b)** Reemplazá el bloque del reveal (`script.js:18-33`, excerpt en "Current
state") por:

```js
// ── Reveal progresivo al scroll (escalonado por tanda) ──
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      const batch = entries.filter((e) => e.isIntersecting);
      batch.forEach((entry, i) => {
        const el = entry.target;
        // Los elementos que entran juntos al viewport se escalonan 80ms entre sí.
        // El delay se limpia al terminar para no demorar transiciones posteriores (hover).
        if (i > 0) {
          el.style.transitionDelay = Math.min(i * 80, 400) + "ms";
          el.addEventListener("transitionend", () => (el.style.transitionDelay = ""), { once: true });
        }
        el.classList.add("is-in");
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
}
```

No toques el bloque del formulario (`validateEmail` en adelante).

Con esto el escalonado es automático en TODAS las páginas: los elementos que
entran al viewport en la misma tanda (una fila de cards, las 6 de servicios)
se escalonan; en mobile de 1 columna entran de a uno (i=0) → sin delay extra.
No hace falta ninguna clase marker en el HTML.

**Verify**:
- `grep -c "transitionDelay" assets/js/script.js` → 2
- `grep -c "is-open" assets/js/script.js` → ≥ 2
- `grep -c "min-width: 768px" assets/js/script.js` → 1
- `grep -c 'classList.toggle("hidden")' assets/js/script.js` → 0

### Step 4: Dot-grid interactivo en touch (`hero-fx.js`)

En la IIFE `dotGrid`, justo después del listener de `mousemove`
(`hero-fx.js:145-149`, el que termina en `});`), agregá:

```js
    // En mobile no hay mouse: seguimos el dedo para que el grid reaccione.
    window.addEventListener(
      "touchmove",
      function (e) {
        var t = e.touches[0];
        if (!t) return;
        var rect = container.getBoundingClientRect();
        mouse.x = t.clientX - rect.left;
        mouse.y = t.clientY - rect.top;
      },
      { passive: true }
    );
```

(Se usa `var` a propósito: `hero-fx.js` está escrito todo con `var`.)

**Verify**: `grep -c "touchmove" assets/js/hero-fx.js` → 1.

### Step 5: Editar el header en las 4 páginas HTML

En **cada uno** de `index.html`, `secciones/servicios.html`,
`secciones/nosotros.html`, `secciones/contacto.html`, hacé DOS cambios idénticos
en el bloque del header:

**(a)** Agregá la clase `nav-link` al principio de la lista de clases de **los
5 links** del `<nav ... aria-label="Principal">` (la nav de desktop) — incluido
el link activo con `aria-current="page"` en las subpáginas (el subrayado
convive con su color violeta). **No** toques los links del panel mobile
`[data-menu]`. Ejemplo:

```html
<a class="text-sm text-white/60 transition-colors hover:text-violet-accent" href="secciones/servicios.html">Servicios</a>
```
pasa a:
```html
<a class="nav-link text-sm text-white/60 transition-colors hover:text-violet-accent" href="secciones/servicios.html">Servicios</a>
```

> En las subpáginas los `href` difieren (usan `../index.html#...` o similares)
> y el link activo tiene otras clases — no importa: solo anteponé `nav-link`
> en los 5, sin cambiar nada más.

**(b)** En el `<div ... data-menu>` (panel mobile), **quitá la clase `hidden`
inicial** (la primera de la lista), dejando el resto intacto. Cambiá:
```html
<div class="hidden border-t border-white/10 bg-ink/95 px-5 py-4 backdrop-blur-xl md:hidden" data-menu>
```
por:
```html
<div class="border-t border-white/10 bg-ink/95 px-5 py-4 backdrop-blur-xl md:hidden" data-menu>
```
Se conserva `md:hidden` (en desktop el panel sigue sin existir) y se conservan
`py-4`/`border-t` (el CSS del Step 1 los colapsa cuando está cerrado y los
restaura con `.is-open`).

**Verify**:
- `grep -c "nav-link" index.html` → 5, y lo mismo en cada archivo de `secciones/`:
  `grep -c "nav-link" secciones/servicios.html` → 5, `grep -c "nav-link" secciones/nosotros.html` → 5, `grep -c "nav-link" secciones/contacto.html` → 5.
- `grep -rn "hidden border-t border-white/10 bg-ink/95" index.html secciones/` → **sin resultados**.

### Step 6: Compilar el CSS

```
npm run build
```

**Verify**:
- exit 0.
- `grep -c "is-open" assets/css/tailwind.css` → > 0
- `grep -c "nav-link" assets/css/tailwind.css` → > 0
- `grep -c "scrolled" assets/css/tailwind.css` → > 0
- `grep -c "overflow-hidden" assets/css/tailwind.css` → > 0 (nota: esta utilidad
  ya se compila porque `index.html` la usa en el hero; este grep NO prueba el
  scroll-lock nuevo — eso lo cubre el punto 2 del Step 7)

Si `is-open` o `nav-link` dan 0, el build no está leyendo `tailwind-src.css`:
STOP y reportá (no edites `tailwind.css` a mano).

### Step 7: Chequeo manual en navegador

Abrí `index.html` y una subpágina (`secciones/servicios.html`) y confirmá:

1. En ancho mobile (<768px), **con el menú cerrado NO se ve ninguna franja ni
   borde extra debajo del header** (si se ve, el colapso de padding del Step 1
   no está aplicando — STOP).
2. Tocando la hamburguesa: se anima a "X", el panel baja con transición, y el
   fondo **no** scrollea con el menú abierto.
3. Tocando un link del menú: se cierra con transición y la hamburguesa vuelve a 3 barras.
4. Con el menú abierto, agrandá la ventana a ≥768px: el scroll del fondo queda
   liberado (no trabado).
5. Hover sobre los links de la nav desktop: aparece el subrayado violeta animado.
6. Al scrollear hacia abajo, el header se oscurece/gana sombra; al volver arriba, vuelve.
7. Las tarjetas de "El problema" y "Servicios" entran escalonadas al scrollear.
8. **Después** de que una card de Servicios ya entró: hacer hover la levanta
   INMEDIATAMENTE (sin retardo) y su fondo/borde cambia con fade suave (no de golpe).
9. Con "Reducir movimiento" activado en el SO: todo aparece sin animación y el
   menú sigue abriendo/cerrando (sin transición).

## Test plan

No hay framework de tests en el repo (AGENTS.md: "Preview by opening any `.html`
in a browser"). La verificación es la combinación de los `grep` de cada step +
el checklist manual del Step 7. No agregar dependencias ni suites de test.

## Done criteria

Todas deben cumplirse:

- [ ] `npm run build` sale con exit 0.
- [ ] `grep -c "is-open" assets/css/tailwind.css` > 0 y `grep -c "nav-link" assets/css/tailwind.css` > 0.
- [ ] `grep -c "nav-link" <archivo>` da 5 en `index.html` y en cada HTML de `secciones/`.
- [ ] `grep -rn "hidden border-t border-white/10 bg-ink/95" index.html secciones/` → sin resultados.
- [ ] `grep -c 'classList.toggle("hidden")' assets/js/script.js` → 0.
- [ ] `grep -c "transitionDelay" assets/js/script.js` → 2.
- [ ] `grep -c "touchmove" assets/js/hero-fx.js` → 1.
- [ ] `grep -c "border-color 0.4s" assets/css/tailwind-src.css` → 2.
- [ ] Checklist manual del Step 7 pasa (los 9 puntos).
- [ ] `git status` no muestra archivos modificados fuera del "In scope".
- [ ] Fila de este plan en `plans/README.md` actualizada a DONE.

## STOP conditions

Pará y reportá (no improvises) si:

- Los excerpts de "Current state" no coinciden con el código vivo (el repo
  cambió desde `6aed75b`) — sobre todo el bloque header, `script.js:1-33` o
  `tailwind-src.css:56-61`.
- En mobile con el menú cerrado queda una franja/borde visible debajo del
  header (punto 1 del Step 7) y no lo resuelve re-aplicar el Step 1 tal cual.
- Tras el Step 6, `is-open` o `nav-link` no aparecen en `tailwind.css`.
- El panel mobile queda visible/expandido en desktop (≥768px) tras los cambios
  — indica que se rompió el `md:hidden`.
- Un `grep` de verificación falla dos veces después de un intento razonable de arreglo.
- Necesitás tocar un archivo fuera del "In scope" para que algo funcione.

## Maintenance notes

- El escalonado del reveal es **por tanda del IntersectionObserver** (JS), no
  por CSS: no tiene techo de cantidad de tarjetas y aplica a todas las páginas.
  El `transition-delay` inline se limpia en `transitionend`; si una card queda
  con hover retardado, revisar que ese cleanup siga existiendo.
- La lista `transition` de `.reveal-ready [data-reveal]` ahora incluye
  `background`/`border-color` para que el hover de `.glass-card` anime en cards
  reveladas (la especificidad del reveal pisa a `.glass-card`). Si se cambia la
  transición de `.glass-card`, actualizar ambas listas.
- El panel `[data-menu]` colapsa con `max-height/padding/border` en vez de
  `display:none`. **ponytail:** sus links quedan técnicamente enfocables por
  teclado mientras está cerrado en viewport mobile — nit de a11y menor aceptado;
  si molesta, togglear `hidden` por JS al terminar la transición (`transitionend`).
- **ponytail:** el scroll-lock usa `overflow-hidden` en `<body>`; en iOS Safari
  viejo el rubber-band puede filtrarse — si molesta, técnica `position:fixed` en body.
- El parallax del hero sigue siendo mouse-only a propósito; el dot-grid ahora sí
  reacciona al dedo. No portar el parallax a touch salvo pedido explícito.
- En review, mirar que el bloque header quedó **idéntico** en las 4 páginas
  (el desalineo previo vino justo de divergencias ahí).
