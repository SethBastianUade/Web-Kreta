# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read **[AGENTS.md](AGENTS.md)** — it is the source of truth for this repo (stack, key files, commands, design conventions, deploy). Keep it updated instead of duplicating it here.

## Essentials

Static landing page for **Kreta**: HTML + compiled Tailwind CSS v3 + vanilla JS. No frameworks, no build step on deploy.

- `npm run build` after editing HTML/JS, then **commit `assets/css/tailwind.css`** (it is committed so Cloudflare Pages serves it buildless). `npm run watch` to recompile on change.
- Edit `assets/css/tailwind-src.css` (Tailwind directives + animations), not the generated `tailwind.css`.
- No test suite. Preview by opening any `.html` in a browser.
- Arbitrary radius values (`rounded-[100px]`, `rounded-[20px]`) are intentional — don't swap for `rounded-full` or pills/circles break.
