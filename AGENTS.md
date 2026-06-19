# Kreta Web — AGENTS.md

## Project identity

Landing page for **Kreta** (tecnología + finanzas). Brand is Kreta, not "Web-Emprendimiento".

## Stack

HTML + **Tailwind CSS (compilado, v3)** + vanilla JS. Estilo "Minimal Editorial"
(monocromático, Noto Serif light, botones pill, bloques redondeados 20px), portado
de un mockup de Stitch. **No Bootstrap, no frameworks JS.**

- El CSS final se **compila** desde `assets/css/tailwind-src.css` → `assets/css/tailwind.css`.
- `tailwind.css` **se commitea** para que el deploy siga siendo buildless (Cloudflare
  Pages sirve estático, sin paso de build). `node_modules` está gitignoreado.
- Tema (paleta M3 monocromática, fonts, fontSize) en `tailwind.config.js`.

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Landing principal en Tailwind (hero, servicios, BiFrost, equipo, FAQ, contacto) |
| `secciones/*.html` | Subpáginas (servicios, nosotros, contacto), mismo stack y estilo que `index.html` |
| `tailwind.config.js` | Tema (colores, fonts, fontSize) |
| `assets/css/tailwind-src.css` | Entrada de Tailwind (`@tailwind` + animaciones: marquee, liquid-orb, reveal) |
| `assets/css/tailwind.css` | **Generado** por `npm run build` — commiteado |
| `assets/js/script.js` | Menú mobile, reveal al scroll (`[data-reveal]`), submit del form (Web3Forms) |
| `assets/img/` | Imágenes + favicon |

## Commands

```bash
npm install        # deps de build (Tailwind + plugin forms)
npm run build      # compila tailwind-src.css → tailwind.css (minify)
npm run watch      # recompila al guardar (dev)
```
Tras tocar clases en el HTML/JS, **rebuildear** (`npm run build`) y commitear el
`tailwind.css` resultante. Previsualizar abriendo `index.html` en el browser.

## Design conventions

- **Headings:** Noto Serif (serif), `font-light` (300). Subtítulos de tarjeta en 500.
- **Body:** Manrope (sans-serif), 300–800.
- **Paleta:** monocromática — `primary #000`, `secondary #5e5e5e`, `background #f9f9f9`,
  bordes `outline-variant #cfc4c5`. Definida en `tailwind.config.js`.
- **Botones:** pill (`rounded-[100px]`), sólidos `bg-primary text-on-primary`.
- **Bloques de imagen / cards:** `rounded-[20px]`, borde `outline-variant`.
- **Forms:** POST a `https://api.web3forms.com/submit` (Web3Forms), `access_key` en el form.
- **WhatsApp:** `wa.me/5491173696380`.
