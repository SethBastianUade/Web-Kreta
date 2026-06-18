# Kreta Web — AGENTS.md

## Project identity

Static landing page for **Kreta** (tecnología + finanzas). Brand is Kreta, not "Web-Emprendimiento".

## Stack

Vanilla HTML + CSS + JS. Zero build tools, no bundler, no npm, no frameworks.

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Single-page landing (hero, servicios, BiFrost, equipo, FAQ, contacto) |
| `assets/css/styles.css` | CSS with custom properties (Fraunces + Manrope via Google Fonts) |
| `assets/js/script.js` | Hamburger menu, IntersectionObserver nav highlighting, form submission |
| `assets/img/favicon.svg` | Favicon |

## Current WIP — static asset migration

The page now references files under `assets/` (`assets/js/`, `assets/css/`, `assets/img/`). Root-level `styles.css`, `script.js`, and `favicon.svg` still exist as stale copies — they should be deleted once `assets/` commit is clean.

## State

- `assets/` contains the active stylesheet, script, and images.
- `README.md`, `skills-lock.json`, and `.agents/` are gitignored.
- `secciones/` has been removed to keep the landing page fully static and self-contained (avoiding CORS issues).

## Commands

No build, test, lint, or format commands exist. Open `index.html` directly in a browser to preview.

## Design conventions

- **Headings:** Fraunces (serif), italic weight 500 for subheadings.
- **Body:** Manrope (sans-serif), weights 400–800.
- **Colors:** Petróleo `#0A2E36`, teal `#1A7A6B`, warm accent `#D4A853`, cool gray palette.
- **Forms:** POST to `https://formsubmit.co/ajax/...` (FormSubmit service).
- **WhatsApp:** Links via `wa.me/5491161332021`.
