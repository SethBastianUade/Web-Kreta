# Plan 003: OG image raster real + saneamiento de assets de imagen

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> Los comandos `grep`/`xxd` de este plan asumen **Git Bash** (viene con Git for
> Windows). Si usás PowerShell, corré cada comando dentro de `bash -c "..."`.
>
> **Drift check (run first)**:
> `git diff --stat c2d9cdb..HEAD -- index.html secciones/ assets/img/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (social/SEO) + tech-debt (assets)
- **Planned at**: commit `c2d9cdb`, 2026-07-08

## Why this matters

Las 4 páginas declaran `og:image` apuntando a `assets/img/og-image.svg`, un
**SVG**. Facebook, LinkedIn, **WhatsApp**, Slack, iMessage y X/Twitter **no
renderizan** imágenes OG en SVG — las descartan. Resultado: hoy **cada link de
kreta.com.ar que se comparte sale sin imagen de preview**. WhatsApp es el canal
principal del negocio (todo el sitio empuja a `wa.me/5491173696380`), así que el
preview roto pega directo en conversión.

Además hay tres archivos en `assets/img/` con la **extensión mentida** (magic
bytes que no coinciden con la extensión) y **sin ninguna referencia** en el
sitio:

- `favicon.webp` → en realidad es un **JPEG** (`ff d8 ff e0`), y el `<link>` lo
  declara `type="image/webp"`. Este SÍ está en uso (es el favicon). Cloudflare
  sirve el `Content-Type` por extensión → tipo incorrecto.
- `favicon-og.webp` → en realidad un **PNG** 1024×1024. **No referenciado.** 1.35 MB muertos.
- `dashboard-bifrost.webp` → en realidad un **PNG**. **No referenciado.** 1.1 MB muertos.
- `favicon.svg` → **No referenciado.**

Cuando esto termine: los previews sociales muestran una imagen 1200×630 real, el
favicon declara su tipo correcto, y se van ~2.5 MB de assets muertos que
Cloudflare hoy podría servir.

## Current state

Stack (de `AGENTS.md`): HTML + Tailwind CSS v3 compilado + JS vanilla, sin
frameworks. Deploy en Cloudflare Pages, **estático, sin build step** — se sirve
lo commiteado. `.assetsignore` controla qué NO se sirve (no incluye
`assets/img/`, así que todo lo que hay ahí se sirve). Dominio: `kreta.com.ar`.

**Verificá los magic bytes antes de empezar** (confirma el diagnóstico):

```
xxd -l 4 assets/img/favicon.webp         # esperado: ffd8 ffe0  (JPEG)
xxd -l 4 assets/img/favicon-og.webp      # esperado: 8950 4e47  (PNG)
xxd -l 4 assets/img/dashboard-bifrost.webp  # esperado: 8950 4e47  (PNG)
```

Si alguno NO coincide, el repo cambió → STOP y reportá.

**El SVG fuente — `assets/img/og-image.svg`** (1200×630, fondo negro sólido, ya
tiene las dimensiones correctas; lo vas a rasterizar tal cual):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#000000"/>
  <g transform="translate(80, 315)">
    <text font-family="'Noto Serif', Georgia, serif" font-size="96" font-weight="300" fill="#ffffff" letter-spacing="-1.5">
      Kreta.
    </text>
    ...
  </g>
  <rect x="80" y="450" width="60" height="3" fill="#ffffff" opacity="0.3"/>
</svg>
```

(Las fuentes `Noto Serif`/`Manrope` pueden no estar instaladas; Chrome cae a
`Georgia`/`Arial` — es aceptable, es como ya se ve el SVG en cualquier lado.)

**Bloque OG en `index.html:15-18`** (idéntico en las 4 páginas salvo la URL de
`og:url`; en subpáginas el bloque arranca en la línea 12):

```html
  <meta property="og:image" content="https://kreta.com.ar/assets/img/og-image.svg">
  <meta property="og:image:type" content="image/svg+xml">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
```

**Favicon link — `index.html:19`** (en subpáginas es la línea 16 y usa `../`):

```html
  <link rel="icon" type="image/webp" href="assets/img/favicon.webp">
```

Chrome headless está disponible en esta máquina:
`C:\Program Files\Google\Chrome\Application\chrome.exe` (confirmado en recon).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Ver magic bytes | `xxd -l 4 <archivo>` | firma esperada arriba |
| Rasterizar OG | (Step 1, comando Chrome headless) | genera `og-image.png` |
| Ver dims PNG | `xxd -s 16 -l 8 assets/img/og-image.png` | `000004b0 00000276` |
| Preview | abrir `index.html` en navegador | chequeo manual |

No hay test suite, typecheck ni lint. No se necesita `npm run build` (este plan
no toca CSS). La verificación es `xxd`/`grep` + el validador social del Step 5.

## Scope

**In scope** (los únicos archivos que podés crear/modificar/borrar):
- `assets/img/og-image.png` (crear)
- `assets/img/favicon.jpg` (crear por rename de `favicon.webp`)
- `assets/img/favicon.webp` (borrar tras el rename)
- `assets/img/favicon-og.webp` (borrar — no referenciado)
- `assets/img/dashboard-bifrost.webp` (borrar — no referenciado)
- `assets/img/favicon.svg` (borrar — no referenciado)
- `index.html`, `secciones/servicios.html`, `secciones/nosotros.html`, `secciones/contacto.html` (solo el `<head>`)
- `plans/README.md` (fila de estado)

**Out of scope** (no tocar):
- `assets/img/og-image.svg` — se conserva como fuente para regenerar el PNG a futuro.
- Cualquier cosa fuera del `<head>` en los HTML (body, nav, form, JSON-LD ya existente).
- `assets/css/*`, `assets/js/*`, `tailwind.config.js`, `.assetsignore`, `robots.txt`, `sitemap.xml`, `llms.txt`.
- Los `og:image:width`/`height` (siguen siendo 1200/630, correctos — no tocarlos).
- Las Twitter Cards (las agrega el plan 004).

## Git workflow

- Branch: `advisor/003-og-image` (crear desde `main`).
- Usá `git mv` para renombrar y `git rm` para borrar, así el rename queda limpio.
- Un solo commit; mensaje estilo repo (ej: "fix: OG image raster real + limpieza de assets de imagen").
- No pushear ni abrir PR salvo que el operador lo pida.

## Steps

### Step 1: Generar `og-image.png` (1200×630) rasterizando el SVG

Chrome renderiza SVG nativamente a su tamaño intrínseco. Como `og-image.svg` ya
declara `width="1200" height="630"`, se le pasa el SVG **directo** (sin wrapper
HTML) y se captura con `--window-size=1200,630`.

> ⚠️ **CRÍTICO — ruta Windows, no Unix.** En Git Bash `$(pwd)` devuelve una ruta
> estilo Unix (`/c/Users/...`). Chrome en Windows **NO** resuelve
> `file:///c/Users/...` → navega a una ruta inexistente y saca screenshot de su
> **propia página de error** (que también mide 1200×630, así que pasa la
> verificación de dimensiones sin ser el arte). **Usá `pwd -W`**, que imprime la
> ruta en formato Windows (`C:/Users/...`).

**(a)** Confirmá primero que `pwd -W` funciona y da una ruta `C:/...`:

```bash
cd assets/img
pwd -W    # debe imprimir algo tipo C:/Users/.../assets/img
```

Si `pwd -W` no existe en tu Git Bash, alternativa: `cygpath -w "$(pwd)"` (y
convertí los `\` a `/`).

**(b)** Rasterizá el SVG directo (seguís dentro de `assets/img`):

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 \
  --screenshot="og-image.png" \
  "file:///$(pwd -W)/og-image.svg"
cd ../..
```

> Nota: si `og-image.png` ya existe y está bloqueado, Chrome puede fallar con
> "Acceso denegado (0x5)" y dejar el archivo viejo intacto. Si pasa: `rm
> assets/img/og-image.png` y volvé a correr el comando.

**Verify** (los tres):
- `xxd -l 4 assets/img/og-image.png` → `8950 4e47` (es un PNG válido).
- `xxd -s 16 -l 8 assets/img/og-image.png` → `000004b0 00000276`
  (ancho 0x4b0 = 1200, alto 0x276 = 630).
- **Contenido correcto (no la página de error):** las dimensiones **no** prueban
  que el PNG sea el arte. Confirmá el contenido: abrí `assets/img/og-image.png`
  en un visor y verificá que se ve el wordmark **"Kreta."** sobre fondo negro
  (NO un ícono de documento con "No se pudo acceder a tu archivo"). Si sos un
  agente sin visor GUI, pedile a tu revisor que lo mire, o compará el peso: el
  arte real ronda ~18 KB; la página de error ~13 KB (heurística, no prueba).

Si el PNG no da 1200×630, o es la página de error, o Chrome no está en esa ruta:
**STOP y reportá** — un humano puede exportar el SVG a PNG 1200×630 con cualquier
editor y colocarlo en `assets/img/og-image.png`; el resto del plan sigue igual.

### Step 2: Apuntar `og:image` al PNG en las 4 páginas

En **cada** archivo (`index.html`, y los 3 de `secciones/`), cambiá SOLO estas
dos líneas del bloque OG:

Antes:
```html
  <meta property="og:image" content="https://kreta.com.ar/assets/img/og-image.svg">
  <meta property="og:image:type" content="image/svg+xml">
```
Después:
```html
  <meta property="og:image" content="https://kreta.com.ar/assets/img/og-image.png">
  <meta property="og:image:type" content="image/png">
```

**No** toques `og:image:width`/`og:image:height` (siguen 1200/630).

**Verify**:
- `grep -rc "og-image.png" index.html secciones/` → 1 en cada archivo (4 en total).
- `grep -rn "og-image.svg" index.html secciones/` → **sin resultados**.
- `grep -rn "image/svg+xml" index.html secciones/` → **sin resultados**.

### Step 3: Corregir el favicon (JPEG mal etiquetado como webp)

**(a)** Renombrá el archivo a su extensión real:

```bash
git mv assets/img/favicon.webp assets/img/favicon.jpg
```

**(b)** En **cada** archivo (`index.html` línea 19, y los 3 de `secciones/`
línea 16), actualizá el `<link>` del favicon. En `index.html`:

```html
  <link rel="icon" type="image/jpeg" href="assets/img/favicon.jpg">
```
En las 3 subpáginas (mantené el `../`):
```html
  <link rel="icon" type="image/jpeg" href="../assets/img/favicon.jpg">
```

**Verify**:
- `grep -rc "favicon.jpg" index.html secciones/` → 1 en cada archivo (4 total).
- `grep -rn "favicon.webp" index.html secciones/` → **sin resultados**.
- `grep -rn 'type="image/webp"' index.html secciones/` → **sin resultados**.
- `ls assets/img/favicon.jpg` → existe; `ls assets/img/favicon.webp 2>/dev/null` → sin salida.

### Step 4: Borrar los 3 assets muertos

Confirmá primero que siguen sin referencias (debe dar salida vacía las 3 veces):

```bash
grep -rn "favicon-og"       --include="*.html" --include="*.js" --include="*.css" . | grep -v node_modules
grep -rn "dashboard-bifrost" --include="*.html" --include="*.js" --include="*.css" . | grep -v node_modules
grep -rn "favicon.svg"      --include="*.html" --include="*.js" --include="*.css" . | grep -v node_modules
```

Si **cualquiera** devuelve una referencia: **STOP y reportá** (dejá de borrar ese
archivo; el diagnóstico de "no usado" era falso).

Si las tres dan vacío, borralos:

```bash
git rm assets/img/favicon-og.webp assets/img/dashboard-bifrost.webp assets/img/favicon.svg
```

**Verify**: `ls assets/img/` → contiene `og-image.png`, `og-image.svg`,
`favicon.jpg` y **nada más** (ni `favicon.webp`, ni `favicon-og.webp`, ni
`dashboard-bifrost.webp`, ni `favicon.svg`).

### Step 5: Validar el preview social (chequeo manual)

El deploy todavía no está hecho, así que validá localmente que el HTML quedó
consistente y que la imagen abre:

1. Abrí `assets/img/og-image.png` en un visor → se ve el arte de Kreta 1200×630.
2. Abrí `index.html` en el navegador → el favicon de la pestaña carga (no ícono roto).
3. `grep -A4 'og:image"' index.html` → muestra `og-image.png`, `image/png`,
   width 1200, height 630 en ese orden.

(Cuando el sitio se deploye, el preview real se puede confirmar en
https://www.opengraph.xyz o el Sharing Debugger de Facebook. Eso queda para
después del merge; no es parte de la ejecución.)

## Test plan

No hay framework de tests (AGENTS.md: "Preview by opening any `.html` in a
browser"). La verificación es la suma de los `xxd`/`grep`/`ls` de cada step + el
chequeo manual del Step 5. No agregar dependencias ni suites.

## Done criteria

Todas deben cumplirse:

- [ ] `xxd -s 16 -l 8 assets/img/og-image.png` → `000004b0 00000276`.
- [ ] `grep -rn "og-image.svg\|image/svg+xml" index.html secciones/` → sin resultados.
- [ ] `grep -rc "og-image.png" index.html secciones/` → 4 (1 por archivo).
- [ ] `grep -rn "favicon.webp\|type=\"image/webp\"" index.html secciones/` → sin resultados.
- [ ] `grep -rc "favicon.jpg" index.html secciones/` → 4.
- [ ] `ls assets/img/` → solo `og-image.png`, `og-image.svg`, `favicon.jpg`.
- [ ] `git status` no muestra archivos modificados fuera del "In scope".
- [ ] Fila de este plan en `plans/README.md` actualizada a DONE.

## STOP conditions

Pará y reportá (no improvises) si:

- Los magic bytes del recon no coinciden (el repo cambió desde `c2d9cdb`).
- Chrome no está en `C:\Program Files\Google\Chrome\Application\chrome.exe` o el
  screenshot no sale 1200×630 tras un reintento razonable.
- El grep de "sin referencias" del Step 4 encuentra un uso de alguno de los 3
  archivos a borrar.
- Necesitás tocar un archivo fuera del "In scope".

## Maintenance notes

- Para regenerar el OG a futuro: editá `og-image.svg` y volvé a correr el Step 1.
  El SVG es la fuente; el PNG es un artefacto derivado (pero **se commitea**,
  porque Cloudflare sirve estático sin build).
- **Deferido (mejora opcional, no en este plan):** el favicon podría migrarse a
  SVG (`<link rel="icon" type="image/svg+xml">`) para nitidez a cualquier
  tamaño, pero eso implica diseñar un ícono SVG limpio; el JPEG actual funciona.
- En review: confirmar que el bloque OG quedó **idéntico** en las 4 páginas y que
  no se coló ningún cambio fuera del `<head>`.
- Las Twitter Cards (plan 004) van a reutilizar `og-image.png` como
  `twitter:image` — no borres el PNG.
