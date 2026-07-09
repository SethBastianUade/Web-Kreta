# 007 — Subset del icon font + guards de compilación WebGL

**Priority:** P1 · **Effort:** S · **Risk:** LOW · **Depends on:** —

Dos fixes independientes, ambos acotados. Van juntos porque ninguno justifica su
propio ciclo de review.

---

## Parte A — Subset de Material Symbols

### Problema

Los 4 `<head>` cargan la fuente variable **completa** de Material Symbols
Outlined (miles de glifos) para usar **20 íconos únicos** (43 usos totales).
Google Fonts soporta `&icon_names=` para servir solo los pedidos.

Ubicaciones (URL idéntica en las 4):

- `index.html:34`
- `secciones/contacto.html:27`
- `secciones/nosotros.html:27`
- `secciones/servicios.html:27`

### Cambio

En las 4 URLs, agregá `&icon_names=<lista>` **antes** de `&display=swap`.
Lista exacta (ordenada alfabéticamente, separada por comas, sin espacios):

```
analytics,bolt,chat,chat_bubble,check,check_circle,code,expand_more,finance_mode,hourglass_empty,hourglass_top,location_on,lock,mail,monitoring,open_in_new,point_of_sale,shopping_cart,storefront,web
```

La URL resultante queda:

```
https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=analytics,bolt,chat,chat_bubble,check,check_circle,code,expand_more,finance_mode,hourglass_empty,hourglass_top,location_on,lock,mail,monitoring,open_in_new,point_of_sale,shopping_cart,storefront,web&display=swap
```

> **No inventes íconos.** Antes de escribir, re-extraé la lista real del repo y
> compará con la de arriba. Si aparece alguno que no está, **agregalo** y
> reportá la diferencia. Comando:
> ```bash
> grep -ho 'material-symbols-outlined[^>]*>[^<]*' index.html secciones/*.html \
>   | sed 's/.*>//' | tr -d ' \t' | sort -u
> ```
> (Ajustá el patrón si el markup usa otra forma; lo importante es que la lista
> final sea un superset de todos los íconos usados.)

### Done criteria (A)

1. `grep -c 'icon_names=' index.html secciones/*.html` → 1 en cada uno de los 4.
2. Ningún ícono usado en el HTML falta de la lista (re-extracción + diff).
3. Ningún `<head>` quedó con una URL sin `&display=swap`.

### Verificación manual (usuario, post-merge)

DevTools → Network → recargar → el `.woff2` de Material Symbols debe pesar
sustancialmente menos que antes. **No pude medirlo** (red sandboxeada), así que
el número exacto queda como dato a confirmar, no como criterio automático.

---

## Parte B — Guards de compilación/linkeo del shader

### Problema

`assets/js/hero-fx.js`:

```js
function cs(type, src) {          // :61-66
  var s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;                       // nunca chequea COMPILE_STATUS
}
var prog = gl.createProgram();    // :67-71
gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog);             // nunca chequea LINK_STATUS
gl.useProgram(prog);
```

Si la compilación falla, `render()` (`:91-100`) igual llama a
`requestAnimationFrame(render)` **para siempre** sobre un programa roto: quema
batería y spamea la consola en cada frame.

Causa plausible de fallo: `hero-fx.js:30` declara `"precision highp float;"`.
`highp` en fragment shaders **no está garantizado** en GLES2 (móviles viejos).

### Cambio

1. En el array `fs`, reemplazá la línea `"precision highp float;",` por:

```js
"#ifdef GL_FRAGMENT_PRECISION_HIGH",
"precision highp float;",
"#else",
"precision mediump float;",
"#endif",
```

2. Hacé que `cs()` devuelva `null` en fallo, y abortá limpio:

```js
function cs(type, src) {
  var s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("aurora-shader: compile failed", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}
var vsh = cs(gl.VERTEX_SHADER, vs);
var fsh = cs(gl.FRAGMENT_SHADER, fs);
if (!vsh || !fsh) return;                 // sin shader: el fondo queda liso, no rompe nada
var prog = gl.createProgram();
gl.attachShader(prog, vsh);
gl.attachShader(prog, fsh);
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
  console.warn("aurora-shader: link failed", gl.getProgramInfoLog(prog));
  return;
}
gl.useProgram(prog);
```

El `return` sale de la IIFE `shader()`, que ya usa `return` como early-exit
(`:11`, `:13`). El canvas queda vacío sobre `bg-ink` → degradación correcta.

### Done criteria (B)

1. `node --check assets/js/hero-fx.js` → exit 0.
2. `grep -c 'COMPILE_STATUS' assets/js/hero-fx.js` → 1.
3. `grep -c 'LINK_STATUS' assets/js/hero-fx.js` → 1.
4. `grep -c 'GL_FRAGMENT_PRECISION_HIGH' assets/js/hero-fx.js` → 1.
5. Ya no queda ninguna línea `"precision highp float;",` **fuera** del `#ifdef`.

---

## STOP conditions

- Si la re-extracción de íconos da una lista muy distinta a la del plan (>2 de
  diferencia), parar y reportar antes de escribir las URLs.
- No toques `npm run build`: este plan no cambia clases de Tailwind.

## Commits (dos, separados)

```
perf: subset de Material Symbols a los 20 iconos usados
fix: guards de compilacion/linkeo y precision fallback en el shader
```
