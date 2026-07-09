# Plan 004: Canonical + Twitter Cards + og:site_name/locale en las 4 páginas

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> Los `grep` asumen **Git Bash**. En PowerShell, envolvé en `bash -c "..."`.
>
> **Drift check (run first)**:
> `git diff --stat c2d9cdb..HEAD -- index.html secciones/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/003-og-image-y-saneamiento-de-imagenes.md (recomendado —
  `twitter:image` reutiliza `og-image.png`; ver nota abajo)
- **Category**: SEO / social
- **Planned at**: commit `c2d9cdb`, 2026-07-08

## Why this matters

Tres brechas de metadatos en el `<head>` de las 4 páginas:

1. **Sin `<link rel="canonical">`.** Con tráfico de campañas (parámetros UTM de
   ads) y variantes de URL (`/` vs `/index.html`, con/sin barra final), Google
   ve varias URLs del mismo contenido y diluye señales de ranking. El canonical
   consolida todo en una URL preferida.
2. **Sin Twitter Cards.** No hay `twitter:card`. En X/Twitter (y varios
   scrapers/apps de chat que leen tags `twitter:` en vez de `og:`) el link cae a
   una card chica o sin imagen. `summary_large_image` da la tarjeta grande con foto.
3. **Falta `og:site_name` y `og:locale`.** Pulido barato: el nombre del sitio y
   el idioma/región (`es_AR`) que varias plataformas muestran en el preview.

Cuando esto termine, las 4 páginas tienen canonical propio, Twitter Card grande
y OG completo.

## Current state

Stack (de `AGENTS.md`): HTML + Tailwind v3 compilado + JS vanilla. Deploy
Cloudflare Pages estático. Dominio `kreta.com.ar`. Este plan **solo edita el
`<head>`** — no toca CSS ni JS, así que **no hace falta `npm run build`**.

Las 4 páginas ya tienen `<title>`, `meta description`, y un bloque OG
(`og:title`, `og:description`, `og:type`, `og:url`, `og:image*`). Vas a
**insertar** líneas, no reemplazar las existentes.

**Anclas por archivo** (verificadas en recon). El canonical se inserta **después
del `<title>`**; el bloque de tags nuevos se inserta **después de la línea
`og:image:height`**.

| Archivo | Línea `<title>` | Línea `og:image:height` | Canonical URL |
|---------|-----------------|-------------------------|---------------|
| `index.html` | 10 | 18 | `https://kreta.com.ar/` |
| `secciones/servicios.html` | 7 | 15 | `https://kreta.com.ar/secciones/servicios.html` |
| `secciones/nosotros.html` | 7 | 15 | `https://kreta.com.ar/secciones/nosotros.html` |
| `secciones/contacto.html` | 7 | 15 | `https://kreta.com.ar/secciones/contacto.html` |

**Ejemplo del bloque actual en `index.html:10-18`** (en subpáginas es igual pero
sin sangría extra y con la URL de `og:url` propia):

```html
  <title>Kreta — BiFrost POS y Soluciones para PyMEs</title>
  <meta property="og:title" content="Kreta — BiFrost POS y Soluciones para PyMEs">
  <meta property="og:description" content="Descubrí BiFrost, el POS con inteligencia financiera para PyMEs. Además, impulsamos tu crecimiento con landing pages, automatizaciones, chatbots y asesoría financiera.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://kreta.com.ar">
  <meta property="og:image" content="https://kreta.com.ar/assets/img/og-image.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
```

> Nota: `og:image`/`og:image:type` muestran los valores **post-plan-003**
> (`.png` / `image/png`). Si el plan 003 todavía no corrió, verás `.svg` /
> `image/svg+xml` — no importa para este plan; igual insertás las líneas nuevas.
> Pero `twitter:image` DEBE apuntar a `og-image.png` (ver dependencia).

**Título y descripción exactos por página** (los vas a reusar textualmente en
`twitter:title` / `twitter:description`):

- **index.html**
  - título: `Kreta — BiFrost POS y Soluciones para PyMEs`
  - desc: `Descubrí BiFrost, el POS con inteligencia financiera para PyMEs. Además, impulsamos tu crecimiento con landing pages, automatizaciones, chatbots y asesoría financiera.`
- **secciones/servicios.html**
  - título: `Servicios Web y Financieros — Kreta`
  - desc: `Detalle completo de nuestras soluciones digitales y financieras en Kreta: desarrollo web, automatizaciones, chatbots, POS BiFrost y consultoría.`
- **secciones/nosotros.html**
  - título: `Sobre Nosotros — Kreta | Tecnología y Finanzas`
  - desc: `Conocé la historia de Kreta, nuestro equipo interdisciplinario y los valores que impulsan nuestras soluciones de tecnología y finanzas.`
- **secciones/contacto.html**
  - título: `Contacto — Kreta | Presupuesto y Asesoramiento`
  - desc: `Escribinos para contarnos sobre tu proyecto de negocio. Recibí una propuesta técnica y financiera a la medida de tus objetivos en menos de 24 horas.`

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Contar tags | `grep -rc "<patrón>" index.html secciones/` | valores del "Verify" |
| Preview | abrir un `.html` en navegador | chequeo manual |

Sin test suite / typecheck / lint. Sin `npm run build` (no se toca CSS).

## Scope

**In scope** (solo el `<head>` de estos 4 archivos):
- `index.html`
- `secciones/servicios.html`
- `secciones/nosotros.html`
- `secciones/contacto.html`
- `plans/README.md` (fila de estado)

**Out of scope** (no tocar):
- Todo lo que esté fuera del `<head>`.
- Los `<meta>` OG ya existentes (no reescribirlos; solo insertar los nuevos).
- El JSON-LD ya existente en `index.html` (lo amplía el plan 005).
- `robots.txt`, `sitemap.xml`, `llms.txt`, CSS, JS, imágenes.

## Git workflow

- Branch: `advisor/004-head-metadata` (desde `main`; si 003 ya está en `main`,
  branchear desde ahí).
- Un commit; mensaje estilo repo (ej: "feat: canonical + Twitter Cards + OG locale").
- No pushear ni abrir PR salvo pedido del operador.

## Steps

### Step 1: Insertar `<link rel="canonical">` después del `<title>` (4 páginas)

En **cada** archivo, inmediatamente **debajo** de la línea `<title>...</title>`,
insertá una línea nueva con el canonical de esa página (ver tabla en "Current
state"). Ejemplos:

`index.html` (después de la línea 10):
```html
  <link rel="canonical" href="https://kreta.com.ar/">
```
`secciones/servicios.html` (después de la línea 7):
```html
  <link rel="canonical" href="https://kreta.com.ar/secciones/servicios.html">
```
(idéntico para `nosotros.html` y `contacto.html` con su URL de la tabla).

**Verify**:
- `grep -rc 'rel="canonical"' index.html secciones/` → 1 en cada archivo (4 total).
- `grep -rn 'canonical' index.html` → URL `https://kreta.com.ar/` (con barra final).

### Step 2: Insertar og:site_name, og:locale y Twitter Cards después de `og:image:height` (4 páginas)

En **cada** archivo, inmediatamente **debajo** de la línea
`<meta property="og:image:height" content="630">`, insertá este bloque,
**reemplazando `TÍTULO` y `DESCRIPCIÓN`** por el título y descripción exactos de
esa página (lista en "Current state"):

```html
  <meta property="og:site_name" content="Kreta">
  <meta property="og:locale" content="es_AR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="TÍTULO">
  <meta name="twitter:description" content="DESCRIPCIÓN">
  <meta name="twitter:image" content="https://kreta.com.ar/assets/img/og-image.png">
```

Ejemplo completo para `index.html`:
```html
  <meta property="og:site_name" content="Kreta">
  <meta property="og:locale" content="es_AR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Kreta — BiFrost POS y Soluciones para PyMEs">
  <meta name="twitter:description" content="Descubrí BiFrost, el POS con inteligencia financiera para PyMEs. Además, impulsamos tu crecimiento con landing pages, automatizaciones, chatbots y asesoría financiera.">
  <meta name="twitter:image" content="https://kreta.com.ar/assets/img/og-image.png">
```

Cuidá los caracteres acentuados y las comillas: copiá el título/desc textual de
la lista (no los reescribas de memoria).

**Verify**:
- `grep -rc 'twitter:card' index.html secciones/` → 1 en cada archivo (4 total).
- `grep -rc 'og:site_name' index.html secciones/` → 1 en cada archivo.
- `grep -rc 'og:locale' index.html secciones/` → 1 en cada archivo.
- `grep -rc 'twitter:image' index.html secciones/` → 1 en cada archivo.
- `grep -rn 'twitter:image' index.html secciones/` → las 4 líneas apuntan a
  `og-image.png` (NO `.svg`).

### Step 3: Chequeo manual

1. Abrí `index.html` y `secciones/contacto.html` en el navegador → siguen
   cargando normal (no rompiste el `<head>`; sin errores de consola).
2. `grep -A9 '<title>' index.html` → ves `<title>`, luego `canonical`, y más
   abajo el bloque OG + los `twitter:*`.

## Test plan

Sin framework de tests. Verificación = los `grep` de cada step + el chequeo
manual del Step 3. Opcional post-deploy: validar la card en
https://cards-dev.twitter.com/validator o https://www.opengraph.xyz (no es parte
de la ejecución).

## Done criteria

Todas deben cumplirse:

- [ ] `grep -rc 'rel="canonical"' index.html secciones/` → 4 (1 por archivo).
- [ ] `grep -rc 'twitter:card' index.html secciones/` → 4.
- [ ] `grep -rc 'og:site_name' index.html secciones/` → 4 y `og:locale` → 4.
- [ ] `grep -rn 'twitter:image' index.html secciones/` → las 4 apuntan a `og-image.png`.
- [ ] El canonical de `index.html` es `https://kreta.com.ar/` y el de cada
      subpágina coincide con su `og:url`.
- [ ] `git status` no muestra cambios fuera de los 4 HTML + `plans/README.md`.
- [ ] Fila de este plan en `plans/README.md` actualizada a DONE.

## STOP conditions

Pará y reportá si:

- Los excerpts de "Current state" no coinciden con el `<head>` vivo (drift desde `c2d9cdb`).
- No encontrás la línea `og:image:height` o el `<title>` en algún archivo.
- Un `grep` de verificación falla dos veces tras un intento razonable de arreglo.
- Necesitás tocar algo fuera del `<head>`.

## Maintenance notes

- Si se agrega una página nueva al sitio, replicar ahí: canonical propio +
  bloque `og:*` + `twitter:*` (copiar el patrón de una subpágina existente).
- `twitter:image` y `og:image` comparten `og-image.png`. Si cambia la imagen OG,
  ambos se actualizan solos (misma URL) — no hay que tocar nada.
- Canonical usa URLs absolutas con `https://kreta.com.ar`. Si el dominio cambia,
  actualizar los 4 canonical + los `og:url` + `twitter:image` + el sitemap.
- En review: confirmar que cada canonical apunta a **su propia** página (no todos
  al home) y que los títulos de `twitter:title` matchean el `<title>` de cada una.
