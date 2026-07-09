# 008 — Higiene de JS + skip link de accesibilidad

**Priority:** P2 · **Effort:** S · **Risk:** LOW · **Depends on:** 006 (mismo archivo `script.js`)

Cinco fixes chicos, todos con verificación limpia. Ninguno cambia el aspecto visual.

---

## Step 1 — Listener `input` fuera del handler de submit (leak)

`assets/js/script.js:78-82`: el `addEventListener("input", …)` se registra
**dentro** del handler de `submit`. Cada submit agrega N listeners nuevos (uno
por campo requerido). Además, la validación en vivo no existe hasta el primer
submit fallido.

Reestructurá el bloque `document.querySelectorAll(".contact-form").forEach(...)`
así (buscá por contenido, no por línea):

```js
document.querySelectorAll(".contact-form").forEach((form) => {
  const requiredInputs = form.querySelectorAll("input[required], select[required], textarea[required]");

  const markField = (input) => {
    const ok = input.value.trim() && !(input.type === "email" && !validateEmail(input.value));
    input.classList.toggle("ring-2", !ok);
    input.classList.toggle("ring-error-soft", !ok);
    return !!ok;
  };

  // Validación en vivo: registrada una sola vez, no por submit.
  requiredInputs.forEach((input) => input.addEventListener("input", () => markField(input)));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formMessage = form.querySelector(".form-note") || document.querySelector("#form-message");
    if (formMessage) {
      formMessage.textContent = "";
      formMessage.className = "form-note mt-3 text-center text-sm";
    }

    let isValid = true;
    requiredInputs.forEach((input) => {
      if (!markField(input)) isValid = false;
    });

    // …resto del handler sin cambios (mensaje de error, fetch, catch)…
  });
});
```

> El nombre de clase `ring-error-soft` viene del plan **006**. Si 006 todavía no
> está aplicado en esta rama, usá `ring-error` y avisá — pero no debería pasar:
> 008 va apilado sobre 006.

`requiredInputs` pasa a estar en el scope del `forEach` externo, así que las
referencias posteriores dentro del handler (la limpieza de rings en el `.then`
de éxito) siguen funcionando.

---

## Step 2 — `scrollHeight` cacheado en la barra de progreso

`assets/js/script.js:185`: `onProgress` lee
`document.documentElement.scrollHeight` en **cada** evento de scroll → fuerza un
reflow por tick.

```js
const progressBar = document.querySelector(".scroll-progress");
if (progressBar) {
  let max = 0;
  const measure = () => {
    max = document.documentElement.scrollHeight - window.innerHeight;
  };
  const onProgress = () => {
    progressBar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  };
  measure();
  onProgress();
  window.addEventListener("scroll", onProgress, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure);
}
```

`load` re-mide después de que carguen fuentes e imágenes (que cambian la altura).

---

## Step 3 — Guard en el contador animado

`assets/js/script.js:161`: `const to = parseFloat(el.dataset.countTo);` — si el
atributo falta o no es numérico, el contador escribe `NaN` en pantalla.

Inmediatamente después de esa línea (y después de `countObserver.unobserve`):

```js
const to = parseFloat(el.dataset.countTo);
if (!Number.isFinite(to)) return;
```

---

## Step 4 — Debounce del `resize` del dot-grid

`assets/js/hero-fx.js:143`: `window.addEventListener("resize", init);` — `init()`
reconstruye el array completo de puntos en cada tick de resize.

```js
var resizeTimer;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(init, 150);
});
```

---

## Step 5 — Skip link (WCAG 2.4.1 "Bypass Blocks")

Ninguna de las 4 páginas tiene skip link. Las 4 ya tienen un `<main>` como target
(`index.html:154` → `<main>`; subpáginas `:86` → `<main class="pt-20">`).

**(a)** Dale `id="main"` al `<main>` de las 4 páginas:

- `index.html` → `<main id="main">`
- `secciones/{contacto,nosotros,servicios}.html` → `<main id="main" class="pt-20">`

**(b)** Insertá como **primer hijo de `<body>`** (`index.html:92`, subpáginas
`:43`) exactamente esta línea:

```html
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[20px] focus:bg-ink-soft focus:px-4 focus:py-2 focus:text-violet-accent focus:ring-2 focus:ring-violet-accent">Saltar al contenido</a>
```

`sr-only` / `not-sr-only` son utilidades nativas de Tailwind. `rounded-[20px]` es
intencional (ver `CLAUDE.md`: no lo cambies por `rounded-full`).

Esto **sí** agrega clases nuevas al HTML → correr `npm run build` y commitear
`assets/css/tailwind.css`.

---

## Done criteria

1. `node --check assets/js/script.js` → exit 0.
2. `node --check assets/js/hero-fx.js` → exit 0.
3. En `script.js`, `addEventListener("input"` aparece **1 sola vez** y **no**
   está dentro del callback de `submit` (revisalo leyendo, no con grep).
4. `grep -c 'Number.isFinite(to)' assets/js/script.js` → 1.
5. `grep -c 'clearTimeout(resizeTimer)' assets/js/hero-fx.js` → 1.
6. `grep -c 'id="main"' index.html secciones/*.html` → 1 en cada uno de los 4.
7. `grep -c 'Saltar al contenido' index.html secciones/*.html` → 1 en cada uno.
8. En los 4 HTML, el `<a href="#main">` es la línea inmediatamente siguiente a
   `<body ...>`.
9. `npm run build` → exit 0, y `grep -q '\.sr-only' assets/css/tailwind.css`.
10. `git status --short` incluye `assets/css/tailwind.css`.

## STOP conditions

- Si al reestructurar el handler de submit se pierde alguna rama (`isValid`
  falso, `.then` de éxito, `.catch`), parar y reportar. El comportamiento
  observable del formulario **no debe cambiar** salvo por la validación en vivo.
- Si `npm run build` falla, parar.

## Commit

```
fix: higiene de listeners/reflow en JS + skip link a11y en las 4 paginas
```
