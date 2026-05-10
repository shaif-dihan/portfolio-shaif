# Architecture

## Overview

shaif.dev is a single-page Astro site with no backend, no database, and no client-side framework. Content lives directly in `.astro` component files. The build produces static HTML/CSS/JS that any web server can serve.

## File map

```
portfolio-shaif/
├── astro.config.mjs        — Astro config; registers Tailwind integration; output: "static"
├── tailwind.config.mjs     — Tailwind config; class-based dark mode; 1.3x font scaling
├── tsconfig.json           — extends astro/tsconfigs/strict
├── package.json            — dev/build/preview scripts and dependencies
│
├── public/
│   └── favicon.svg         — site favicon (inline SVG)
│
├── src/
│   ├── layouts/
│   │   └── Layout.astro    — base HTML, <head> meta/OG tags, font loading,
│   │                         theme-init inline script (FOUC prevention),
│   │                         body wrapper with light/dark classes
│   │
│   ├── components/
│   │   ├── Nav.astro       — sticky top nav, theme toggle (sun/moon), mobile menu
│   │   ├── Hero.astro      — name, tagline, CTA buttons, social icon row
│   │   ├── Highlights.astro — "What I Bring" 4-card grid (cross-platform, security, payments, product)
│   │   ├── Experience.astro — timeline of 3 jobs with expand/collapse for long lists
│   │   ├── Projects.astro  — 15 projects grouped by 8 categories; compact list rows
│   │   ├── Skills.astro    — 16 skill categories rendered as flat tag lists
│   │   ├── Education.astro — KUET card + IELTS C1
│   │   ├── Contact.astro   — email/LinkedIn/GitHub buttons + phone numbers
│   │   ├── Activities.astro — leadership roles + Math Olympiad achievements
│   │   └── Footer.astro    — copyright + location
│   │
│   └── pages/
│       └── index.astro     — root page; composes Layout + Nav + all sections + Footer
│
├── .claude/
│   └── launch.json         — Claude Code preview server config
│
└── docs/                   — this folder
    ├── ARCHITECTURE.md
    ├── CONTENT.md
    └── DEPLOYMENT.md
```

## How sections compose

`src/pages/index.astro` is the only page. It imports `Layout` and every section component, then renders them in order:

```
Layout
└── Nav (fixed, sticky)
└── main
    ├── Hero
    ├── Highlights
    ├── Experience
    ├── Projects
    ├── Skills
    ├── Education
    ├── Contact
    └── Activities
└── Footer
```

To reorder sections, change the order of `<Component />` tags in `index.astro`. Nav links use anchor IDs (`#highlights`, `#experience`, etc.) — keep those IDs stable.

## Theme system

Class-based dark mode via Tailwind (`darkMode: "class"` in `tailwind.config.mjs`):

1. Inline script in `Layout.astro` runs **before paint**: reads `localStorage.theme`, falls back to `prefers-color-scheme`, adds `dark` class to `<html>` if needed. Prevents FOUC.
2. Toggle button in `Nav.astro` flips the class on click and writes to `localStorage`.
3. Every component declares both light and dark styles via Tailwind's `dark:` variant (e.g. `text-gray-700 dark:text-gray-300`).

## Font sizing

Tailwind's default font-size scale is overridden in `tailwind.config.mjs` to be ~1.3× larger across the board (`base: 1.3rem` instead of `1rem`). All `text-*` utilities scale together, so layout proportions stay intact.

## Build output

`npm run build` produces `dist/`:

```
dist/
├── _astro/         — bundled CSS (and JS for the toggle/menu scripts)
├── favicon.svg
└── index.html      — fully rendered single page
```

Total output is ~36KB. No runtime JS dependencies — only the small inline scripts for theme toggle, mobile menu, and experience expand/collapse.

## Conventions

- **No client-side framework.** No React, no Svelte, no Vue. Just Astro components (server-rendered HTML) plus a few `<script>` blocks for interactivity.
- **Content lives in components.** No CMS, no markdown, no JSON. Update `.astro` files directly.
- **Tailwind for all styling.** No custom CSS files except the small `<style is:global>` in `Layout.astro`.
- **Strict TypeScript** for `.astro` frontmatter typing.
