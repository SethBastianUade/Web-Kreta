# 009 — Loops de `requestAnimationFrame`: pausar el dot-grid, capar el shader

**Priority:** P2 · **Effort:** M · **Risk:** **MED** · **Depends on:** 007 (mismo archivo)

> Aislado en su propio commit **porque es el único plan de esta tanda que puede
> cambiar el aspecto visual**. Si algo sale mal, se revierte solo este commit.

## Problema

`assets/js/hero-fx.js` tiene dos loops de rAF que corren **para siempre**, sin
importar si lo que dibujan está en pantalla:

1. **dot-grid** (`:123-142`): `animate()` limpia el canvas y dibuja cientos de
   `ctx.arc()` por frame. El grid vive dentro del hero (`index.html:159`), o sea
   que apenas el usuario scrollea 100vh deja de verse — y sigue dibujando.
2. **shader** (`:91-100`): el canvas es `fixed inset-0` (`index.html:96-98`), o
   sea siempre a pantalla completa, evaluando 2× simplex noise **por píxel** a
   60fps, en las 4 páginas.

Ambos ya respetan `prefers-reduced-motion` (`hero-fx.js:6`, `:11`, `:106`).

> Ojo con la intuición: `syncSize()` (`:15-22`) ya renderiza a 1× CSS px, **no** a
> `devicePixelRatio`. Así que en pantallas HiDPI ya se ahorra el 4×. El ahorro
> grande del shader viene del **cap de framerate**, no de la resolución.

---

## Step 1 — Pausar el dot-grid cuando sale del viewport

En la IIFE `dotGrid()`, reemplazá el par `animate()` / `requestAnimationFrame(animate)`
por una versión con handle y un `IntersectionObserver` sobre `container`:

```js
var rafId = null;
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // …cuerpo del loop sin cambios (arcos)…
  rafId = requestAnimationFrame(animate);
}
function start() {
  if (rafId === null) rafId = requestAnimationFrame(animate);
}
function stop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

init();
if (typeof IntersectionObserver !== "undefined") {
  new IntersectionObserver(function (entries) {
    entries[0].isIntersecting ? start() : stop();
  }).observe(container);
} else {
  start(); // ponytail: sin IO, comportamiento previo
}
```

Sin `threshold` explícito, el observer usa `0` → arranca apenas 1px del grid es
visible. Es lo que queremos.

**No** llames a `animate()` directamente al final; el observer dispara en el
primer tick con el estado inicial.

---

## Step 2 — Capar el shader a ~30fps

En la IIFE `shader()`, reemplazá `render()`:

```js
var lastDraw = 0;
var FRAME_MS = 1000 / 30; // ponytail: 30fps alcanza para un gradiente lento
function render(t) {
  requestAnimationFrame(render);
  if (t - lastDraw < FRAME_MS) return;
  lastDraw = t;
  if (typeof ResizeObserver === "undefined") syncSize();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform1f(uTime, t * 0.001);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform2f(uMouse, mouse.x, mouse.y);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
render(0);
```

`u_time` sigue derivándose del timestamp real (`t * 0.001`), así que la animación
avanza a la misma velocidad; solo se dibujan la mitad de los frames.

---

## Step 3 — Bajar la resolución interna del shader

En `syncSize()`, renderizá a **0.5× CSS px**. El canvas se estira por CSS, y como
lo que dibuja es un gradiente suave, el upscale no se nota.

```js
var SCALE = 0.5; // ponytail: gradiente suave, el upscale es invisible; subir a 1 si aparece banding
function syncSize() {
  var w = Math.max(1, Math.round((canvas.clientWidth || 1280) * SCALE)),
    h = Math.max(1, Math.round((canvas.clientHeight || 720) * SCALE));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}
```

⚠️ El handler de `mousemove` (`:83-89`) mapea el mouse a coordenadas de canvas
usando `canvas.width` / `canvas.height`, que ahora están escalados. Como
`u_mouse` se divide por `u_resolution` en el shader (`:47`), la normalización se
cancela sola y **no hace falta tocar nada**. Verificalo moviendo el mouse: el
highlight tiene que seguir al cursor exactamente.

El canvas ya tiene `h-full w-full` por CSS (`index.html:96-98`), así que se
estira solo. No agregues `style.width`/`style.height`.

---

## Done criteria

1. `node --check assets/js/hero-fx.js` → exit 0.
2. `grep -c 'cancelAnimationFrame' assets/js/hero-fx.js` → 1.
3. `grep -c 'IntersectionObserver' assets/js/hero-fx.js` → 2 (el guard y el `new`).
4. `grep -c 'FRAME_MS' assets/js/hero-fx.js` → 2.
5. `grep -c 'SCALE' assets/js/hero-fx.js` → 3.
6. No se tocó ningún `.html`, ni `tailwind.config.js`, ni el CSS.
7. El único archivo modificado es `assets/js/hero-fx.js`.

## Verificación manual — obligatoria antes de aprobar

Abrir `index.html` en el navegador y confirmar los 4 puntos:

- [ ] El fondo aurora se sigue viendo suave: **sin banding, sin escalones, sin
      pixelado visible**.
- [ ] El highlight violeta del shader sigue al cursor sin offset.
- [ ] El dot-grid del hero reacciona al mouse igual que antes.
- [ ] Scrolleando más allá del hero y volviendo, el dot-grid retoma la animación.

## STOP conditions (leer antes de empezar)

- **Si el fondo muestra banding o escalones tras el Step 3: no lo "arregles a
  ojo".** Poné `SCALE = 1` (revirtiendo solo el Step 3, dejando 1 y 2), reportá
  el hallazgo y terminá ahí. Los Steps 1 y 2 dan la mayor parte del ahorro.
- Si el highlight del mouse se desincroniza, es señal de que la normalización
  `u_mouse / u_resolution` no cancela como se esperaba → revertir Step 3 y
  reportar.
- No mezcles este cambio con nada de los planes 006/007/008.

## Commit

```
perf: pausar el dot-grid fuera de viewport y capar el shader a 30fps
```
