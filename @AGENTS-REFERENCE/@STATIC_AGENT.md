# AGENTS.md — Static Web Project

## Purpose

Defines rules for modular static HTML/CSS/JS projects with zero build step.

**Goal:** clean, portable, token-driven, and fully accessible output.

## Stack & Conventions

- HTML5 semantic markup with ARIA where needed
- Vanilla JS with ES modules; no frameworks
- CSS variables with OKLCH color tokens from `/shared/tokens.json`
- Inter + JetBrains Mono fonts; Phosphor icons via CDN
- Mobile-first layouts; no flex-wrap — use scroll or truncation
- UTF-8 encoding, LF endings, 2-space indent

## Structure

```
/frontend-static
 ├─ index.html
 ├─ /templates (base.html, section.html, card.html, modal.html)
 ├─ /scripts (app.js, filters.js, ui-helpers.js)
 ├─ /styles (tokens.css, reset.css, layout.css, components.css, utilities.css)
 ├─ /data (core.json, config.json)
 ├─ /assets (/images, /icons)
 └─ /docs (usage, localization, automation)
```

## Authoring Rules

- Separate structure, style, and behavior strictly
- Never inline JS or CSS except for critical styles in `<head>`
- Follow token-first design: color, spacing, typography via CSS variables
- Components reusable via template fragments (no templating engine)
- Accessibility: label inputs, use focus outlines, test keyboard navigation
- SEO: include meta, Open Graph, and structured data in `<head>`
- Use AVIF/WebP images with defined width/height
- No flex-wrap anywhere; use scroll-x utilities for overflow

## Agent Behavior

- Scoped edits only; preserve structure and indentation
- Extend or modify `tokens.css` instead of hardcoding values
- Keep scripts dependency-light; prefer CDN or native Web APIs
- When adding sections, ensure spacing and typography follow scale
- Comment intent behind any DOM manipulation or event handling

## Development

```bash
python -m http.server 8080
```

Or with Node.js:

```bash
npx http-server -p 8080 -c-1
```

Optional live reload:

```bash
npx browser-sync start --server --files "**/*" --no-notify
```

## Validation

```bash
npx html-validate "**/*.html"
npx stylelint "**/*.css" --fix
npx eslint "**/*.js" --fix
npx lighthouse http://localhost:8080 --view
```

## Deployment

- Works out-of-box (no build step required)
- Publish root directory directly to Coolify (Static Build Pack)
- Set cache headers for `/assets`, `/styles`, `/scripts`
- Enable gzip/Brotli compression at server level
- Verify Lighthouse ≥ 90 (Performance, SEO, Accessibility)

## Version Control

- **Branches:** main / feature/* / fix/* / docs/*
- **Commits:** imperative, one logical change per commit
- Include accessibility + performance validation before PR merge

## Philosophy

Lightweight, structured, and timeless.

**OKLCH-driven design, zero build complexity, and fully modular HTML.**

Simple by default, beautiful by design, production-ready always.