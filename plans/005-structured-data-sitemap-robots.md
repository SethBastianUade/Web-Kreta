# Plan 005: Structured data local + sitemap lastmod + limpieza de robots

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> Los `grep`/`git log` asumen **Git Bash**. En PowerShell, envolvé en `bash -c "..."`.
>
> **Drift check (run first)**:
> `git diff --stat c2d9cdb..HEAD -- index.html secciones/ sitemap.xml robots.txt`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (independiente de 003/004; solo evitá correrlo en
  paralelo con 004 sobre los mismos HTML para no chocar diffs)
- **Category**: SEO
- **Planned at**: commit `c2d9cdb`, 2026-07-08

## Why this matters

Tres mejoras de descubribilidad de bajo riesgo:

1. **SEO local ausente.** El JSON-LD `Organization` de `index.html` no declara
   `address`, `areaServed` ni `telephone`. Para búsquedas locales ("desarrollo
   de software Buenos Aires", "asesoría financiera PyME Argentina") Google usa
   esas señales. Agregarlas mejora la relevancia geográfica sin inventar datos
   (Kreta opera en Buenos Aires, AR; tel = el WhatsApp de negocio).
2. **Subpáginas sin structured data.** Solo el home tiene JSON-LD. Un
   `BreadcrumbList` en las 3 subpáginas le da a Google la miga de pan que puede
   mostrar en los resultados (Inicio › Servicios) y refuerza la jerarquía del sitio.
3. **`sitemap.xml` sin `<lastmod>`** y **`robots.txt` que expone rutas internas.**
   Google ignora `changefreq`/`priority` pero sí usa `lastmod`. Y el `robots.txt`
   lista `Disallow` para `/.git/`, `/.claude/`, `/plans/`, etc. — rutas que
   **ya no se sirven** (están en `.assetsignore`, Cloudflare devuelve 404), así
   que listarlas solo le señala a curiosos que existen. Se quitan.

## Current state

Stack (de `AGENTS.md`): HTML + Tailwind v3 compilado + JS vanilla, Cloudflare
Pages estático. Dominio `kreta.com.ar`. WhatsApp de negocio:
`wa.me/5491173696380` (→ teléfono `+5491173696380`). Ubicación declarada en
`llms.txt`: "Buenos Aires, Argentina". Email: `contacto@kreta.com.ar`.
**Este plan no toca CSS/JS** → no hace falta `npm run build`.

`.assetsignore` (confirmado en recon) ya excluye del deploy: `node_modules`,
`.git`, `.gitignore`, `.assetsignore`, `package.json`, `package-lock.json`,
`tailwind.config.js`, `assets/css/tailwind-src.css`, `AGENTS.md`, `CLAUDE.md`,
`README.md`, `skills-lock.json`, `.agents`, `.claude`, `stitch`, `plans`. Por
eso todos los `Disallow` de `robots.txt` apuntan a rutas no servidas.

**JSON-LD Organization actual — primer bloque `<script type="application/ld+json">`
en `index.html` (arranca en la línea 34)**:

```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kreta",
    "url": "https://kreta.com.ar",
    "description": "Tecnología y finanzas para PyMEs. Creamos landing pages, automatizaciones, chatbots, y ofrecemos BiFrost POS con inteligencia financiera.",
    "email": "contacto@kreta.com.ar",
    "foundingDate": "2025",
    "knowsAbout": ["Desarrollo de software", "Finanzas corporativas", "POS", "Automatización", "Chatbots"],
    "sameAs": ["https://wa.me/5491173696380"]
  }
  </script>
```

Hay **dos** bloques JSON-LD más en `index.html` (Product BiFrost, FAQPage) — no
los toques.

**`</head>` de las subpáginas** (verificado en recon): `secciones/servicios.html`
línea 25, `secciones/nosotros.html` línea 25, `secciones/contacto.html` línea 25.
Ninguna tiene JSON-LD todavía.

**`sitemap.xml` actual (completo)**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kreta.com.ar/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://kreta.com.ar/secciones/servicios.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://kreta.com.ar/secciones/nosotros.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://kreta.com.ar/secciones/contacto.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

**`robots.txt` — bloque de buscadores (líneas 4-12)**:

```
User-agent: *
Allow: /
Disallow: /assets/css/tailwind-src.css
Disallow: /stitch/
Disallow: /plans/
Disallow: /node_modules/
Disallow: /.git/
Disallow: /.agents/
Disallow: /.claude/
```

(El resto del archivo — la línea `Sitemap:` y toda la sección "LLMs / AI
crawlers" — se conserva sin cambios.)

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Fecha último commit de un archivo | `git log -1 --format=%cs -- <archivo>` | `YYYY-MM-DD` |
| Contar/buscar | `grep -rc "<patrón>" <archivos>` | valores del "Verify" |
| Validar JSON-LD | (post-deploy) https://validator.schema.org | — |

Sin test suite / typecheck / lint. Sin `npm run build`.

## Scope

**In scope**:
- `index.html` (solo el primer bloque JSON-LD, el `Organization`)
- `secciones/servicios.html`, `secciones/nosotros.html`, `secciones/contacto.html` (agregar un `<script>` JSON-LD antes de `</head>`)
- `sitemap.xml`
- `robots.txt`
- `plans/README.md` (fila de estado)

**Out of scope** (no tocar):
- Los bloques JSON-LD `Product` (BiFrost) y `FAQPage` de `index.html`.
- Cualquier cosa fuera del `<head>` en los HTML.
- `llms.txt`, CSS, JS, imágenes, `tailwind.config.js`, `.assetsignore`.
- La sección "LLMs / AI crawlers" y la línea `Sitemap:` de `robots.txt`.

## Git workflow

- Branch: `advisor/005-structured-data-sitemap` (desde `main`).
- Un commit; mensaje estilo repo (ej: "feat: SEO local (schema), sitemap lastmod, robots cleanup").
- No pushear ni abrir PR salvo pedido del operador.

## Steps

### Step 1: Ampliar el JSON-LD Organization con datos locales (`index.html`)

En el **primer** bloque `<script type="application/ld+json">` (el `Organization`,
excerpt en "Current state"), reemplazá la línea:

```json
    "foundingDate": "2025",
```
por estas líneas (agrega `telephone`, `address` y `areaServed`; conservá la coma
final para que el JSON siga válido):

```json
    "foundingDate": "2025",
    "telephone": "+5491173696380",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Buenos Aires",
      "addressRegion": "CABA",
      "addressCountry": "AR"
    },
    "areaServed": "AR",
```

No cambies `name`/`url`/`description`/`email`/`knowsAbout`/`sameAs`.

**Verify**:
- `grep -c '"areaServed"' index.html` → 1.
- `grep -c '"PostalAddress"' index.html` → 1.
- `grep -c '"telephone"' index.html` → 1.
- Validá que el JSON sigue bien formado (comas): abrí `index.html` en el
  navegador y en la consola pegá:
  `[...document.querySelectorAll('script[type="application/ld+json"]')].forEach(s=>JSON.parse(s.textContent))`
  → **no debe tirar error** (si tira `SyntaxError`, quedó una coma mal → arreglá antes de seguir).

### Step 2: Agregar `BreadcrumbList` a las 3 subpáginas

En **cada** subpágina, insertá un bloque `<script>` **justo antes** de la línea
`</head>` (línea 25 en las tres). Contenido por página:

`secciones/servicios.html`:
```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://kreta.com.ar/" },
      { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://kreta.com.ar/secciones/servicios.html" }
    ]
  }
  </script>
```

`secciones/nosotros.html` (cambian `name` y las dos URLs de la posición 2):
```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://kreta.com.ar/" },
      { "@type": "ListItem", "position": 2, "name": "Nosotros", "item": "https://kreta.com.ar/secciones/nosotros.html" }
    ]
  }
  </script>
```

`secciones/contacto.html`:
```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://kreta.com.ar/" },
      { "@type": "ListItem", "position": 2, "name": "Contacto", "item": "https://kreta.com.ar/secciones/contacto.html" }
    ]
  }
  </script>
```

**Verify**:
- `grep -rc 'BreadcrumbList' secciones/` → 1 en cada uno de los 3 archivos.
- En cada subpágina, el `item` de la posición 2 coincide con su propia URL
  (`grep -n 'position": 2' secciones/servicios.html` y confirmá la URL de la línea siguiente).
- Consola del navegador (misma verificación de JSON válido del Step 1) en cada
  subpágina → sin `SyntaxError`.

### Step 3: Agregar `<lastmod>` a `sitemap.xml`

Obtené la fecha del último commit de cada archivo:

```bash
git log -1 --format=%cs -- index.html
git log -1 --format=%cs -- secciones/servicios.html
git log -1 --format=%cs -- secciones/nosotros.html
git log -1 --format=%cs -- secciones/contacto.html
```

Cada comando imprime una fecha `YYYY-MM-DD`. Agregá un `<lastmod>` con esa fecha
como **primer** hijo de cada `<url>` (la del home usa la fecha de `index.html`).
Resultado esperado (fechas de ejemplo — usá las que devuelva `git log`):

```xml
  <url>
    <loc>https://kreta.com.ar/</loc>
    <lastmod>2026-07-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
```

…y lo mismo en los otros 3 `<url>` con su fecha respectiva. No borres
`changefreq`/`priority` (no molestan; solo agregás `lastmod`).

**Verify**:
- `grep -c '<lastmod>' sitemap.xml` → 4.
- `grep -oP '(?<=<lastmod>)[0-9-]+' sitemap.xml` → 4 fechas con formato `YYYY-MM-DD`.

### Step 4: Limpiar el bloque `Disallow` de `robots.txt`

Reemplazá las líneas 4-12 (excerpt en "Current state") por solo:

```
User-agent: *
Allow: /
```

Es decir, **borrá las 7 líneas `Disallow:`** (tailwind-src.css, stitch, plans,
node_modules, .git, .agents, .claude). Dejá **intacto** todo lo demás del archivo:
los comentarios de cabecera, la línea `Sitemap: https://kreta.com.ar/sitemap.xml`
y toda la sección "LLMs / AI crawlers".

**Verify**:
- `grep -c 'Disallow:' robots.txt` → **0**.
- `grep -c 'Sitemap:' robots.txt` → 1 (se conservó).
- `grep -c 'GPTBot\|ClaudeBot\|PerplexityBot' robots.txt` → 3 (la sección AI intacta).

## Test plan

Sin framework de tests. Verificación = los `grep`/consola de cada step.
Post-deploy (opcional, no parte de la ejecución): pasar cada URL por
https://validator.schema.org y el sitemap por Search Console.

## Done criteria

Todas deben cumplirse:

- [ ] `grep -c '"areaServed"' index.html` → 1; `"PostalAddress"` → 1; `"telephone"` → 1.
- [ ] Los 3 bloques JSON-LD de `index.html` parsean sin error (consola del Step 1).
- [ ] `grep -rc 'BreadcrumbList' secciones/` → 1 en cada subpágina.
- [ ] `grep -c '<lastmod>' sitemap.xml` → 4, todas `YYYY-MM-DD`.
- [ ] `grep -c 'Disallow:' robots.txt` → 0; `Sitemap:` → 1; sección AI intacta.
- [ ] `git status` no muestra cambios fuera del "In scope".
- [ ] Fila de este plan en `plans/README.md` actualizada a DONE.

## STOP conditions

Pará y reportá si:

- Los excerpts de "Current state" no coinciden con el código vivo (drift desde `c2d9cdb`).
- Tras el Step 1 o 2, algún `JSON.parse` de la consola tira `SyntaxError` y no lo
  resolvés revisando comas/comillas en un intento.
- No encontrás `</head>` en alguna subpágina, o el bloque `Organization` en `index.html`.
- Necesitás tocar un archivo fuera del "In scope" (p. ej. `.assetsignore`).

## Maintenance notes

- **`lastmod` se desactualiza solo:** cada vez que se edite el contenido de una
  página, hay que actualizar su `<lastmod>` en `sitemap.xml` (o automatizarlo a
  futuro con un script que lea `git log`). Es tolerable manual para 4 URLs.
- Si se agrega una subpágina nueva, sumar su `<url>` con `lastmod` al sitemap y
  su `BreadcrumbList` en el `<head>`.
- **ponytail:** no se agregó `LocalBusiness`/`ProfessionalService` completo
  porque Kreta no tiene dirección de calle pública (solo localidad); forzar un
  `LocalBusiness` sin `streetAddress`/`geo` da datos débiles. Se enriqueció
  `Organization` con `address`(localidad)+`areaServed`, que es honesto. Si más
  adelante hay oficina con dirección, migrar a `ProfessionalService` con
  `streetAddress`, `geo` y `openingHours`.
- El `robots.txt` ahora no oculta rutas: no hace falta, `.assetsignore` ya impide
  que se sirvan. Si en el futuro algo sensible SÍ se sirviera, la protección va
  en `.assetsignore`/headers, no en `robots.txt` (que es público).
- En review: confirmar que los 3 bloques JSON-LD del home siguen parseando y que
  cada breadcrumb de subpágina apunta a su propia URL, no todos a Servicios.
