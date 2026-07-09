# 006 — Mensajes del formulario: contraste WCAG AA

**Priority:** P1 · **Effort:** S · **Risk:** LOW · **Depends on:** —

## Problema

`assets/js/script.js` pinta el estado del formulario de contacto con tokens M3
legacy pensados para tema claro, sobre un fondo oscuro (`bg-ink` = `#0a0a0a`):

- `script.js:116` — éxito → `text-primary` = `#000000` → contraste ≈ **1.05:1**.
  El mensaje "¡Gracias por escribirnos!" es **invisible**. Un lead envía el
  formulario y no ve confirmación.
- `script.js:88` y `script.js:131` — error → `text-error` = `#ba1a1a` → ≈ **2.8:1**,
  no pasa WCAG AA (mínimo 4.5:1 para texto normal).
- `script.js:75`, `:81`, `:119` — inputs inválidos → `ring-error` (`#ba1a1a`),
  apenas distinguible sobre oscuro.

El `<p>` contenedor (`index.html:456`, `secciones/contacto.html:178`) tiene
`role="status" aria-live="polite"`, así que los lectores de pantalla **sí**
anuncian el mensaje. El fallo afecta solo a usuarios videntes — por eso ningún
audit automático de a11y lo caza.

`.form-note` no tiene regla de color propia en `assets/css/tailwind-src.css`;
el color sale enteramente de las clases que agrega el JS.

## ⚠️ Dato crítico

`tailwind.config.js` tiene:

```js
content: ['./index.html', './secciones/*.html', './assets/js/*.js']
```

Las clases que aparecen como **strings dentro de `script.js` sí se compilan**.
Por eso este cambio obliga a `npm run build` y a **commitear
`assets/css/tailwind.css`** (Cloudflare Pages lo sirve buildless).

## Cambios

### Step 1 — Token nuevo en `tailwind.config.js`

Dentro de `theme.extend.colors`, junto a los tokens Aurora (`ink`, `ink-soft`,
`violet-accent`, …), agregá:

```js
'error-soft': '#ff6b6b',
```

No toques `error: '#ba1a1a'` ni `primary: '#000000'` — son tokens M3 legacy que
otras partes podrían usar; solo dejamos de usarlos en el JS.

### Step 2 — `assets/js/script.js`

Reemplazos exactos (buscá por contenido, no por número de línea):

| Ubicación | Antes | Después |
|---|---|---|
| éxito (`:116`) | `formMessage.classList.add("text-primary");` | `formMessage.classList.add("text-violet-accent");` |
| error validación (`:88`) | `formMessage.classList.add("text-error");` | `formMessage.classList.add("text-error-soft");` |
| error fetch (`:131`) | `formMessage.classList.add("text-error");` | `formMessage.classList.add("text-error-soft");` |
| ring inválido (`:75`) | `input.classList.toggle("ring-error", !fieldValid);` | `input.classList.toggle("ring-error-soft", !fieldValid);` |
| ring live (`:81`) | `input.classList.toggle("ring-error", !ok);` | `input.classList.toggle("ring-error-soft", !ok);` |
| limpieza (`:119`) | `i.classList.remove("ring-2", "ring-error")` | `i.classList.remove("ring-2", "ring-error-soft")` |

`text-violet-accent` (`#c5c0ff`) sobre `#0a0a0a` da ≈ **13.6:1** → AAA.
`text-error-soft` (`#ff6b6b`) sobre `#0a0a0a` da ≈ **6.2:1** → AA (y AA large).

Verificá que después del cambio **no quede ninguna** ocurrencia de
`text-primary`, `text-error` ni `ring-error` en `assets/js/script.js`.

### Step 3 — Recompilar y commitear el CSS

```bash
npm run build
```

## Done criteria

Todos deben pasar:

1. `npm run build` termina con exit 0.
2. `grep -c 'text-primary\|text-error"\|ring-error"' assets/js/script.js` → 0
   ocurrencias (usá `grep -o` + conteo; `grep -c` con 0 matches sale con exit 1,
   no encadenes con `&&`).
3. `grep -q 'text-violet-accent' assets/css/tailwind.css` → encuentra la clase.
4. `grep -q '\.text-error-soft' assets/css/tailwind.css` → encuentra la clase.
5. `grep -q '\.ring-error-soft' assets/css/tailwind.css` → encuentra la clase.
6. `git status --short` muestra `assets/css/tailwind.css` modificado (si no
   aparece, el build no emitió nada → algo salió mal, **STOP**).
7. Los 3 archivos modificados son exactamente: `tailwind.config.js`,
   `assets/js/script.js`, `assets/css/tailwind.css`. Nada más.

## Verificación manual (para el usuario, post-merge)

Abrir `index.html`, enviar el formulario vacío → el mensaje de error se lee en
rojo salmón. Enviar uno válido → el "¡Gracias!" se lee en violeta claro.

## STOP conditions

- Si `npm run build` falla → parar y reportar el error completo.
- Si `assets/css/tailwind.css` no cambia tras el build → parar (indica que el
  `content` glob no está tomando el JS y todo el plan es inválido).

## Commit

```
fix: contraste WCAG AA en mensajes y rings del formulario de contacto
```
