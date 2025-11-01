---
name: static-web-guide
description: Guide for creating modular static HTML/CSS/JS projects with OKLCH tokens, zero build step, semantic markup, and mobile-first design. Use when building static websites, landing pages, or projects requiring no build tooling.
version: 1.0.0
---

# Static Web Project Guide

## Purpose

Create modular static HTML/CSS/JS projects with zero build step. Clean, portable, token-driven, and fully accessible output.

## When to Use This Skill

- Building static websites or landing pages
- Creating projects without build tooling
- Developing portable HTML/CSS/JS applications
- Implementing semantic markup and accessibility patterns
- Working with vanilla JavaScript and ES modules

## Stack & Conventions

- HTML5 semantic markup with ARIA where needed
- Vanilla JS with ES modules; no frameworks
- CSS variables with OKLCH color tokens from `/shared/tokens.json`
- Inter + JetBrains Mono fonts; Phosphor icons via CDN
- Mobile-first layouts; no flex-wrap — use scroll or truncation
- UTF-8 encoding, LF endings, 2-space indent

## Project Structure

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

- **Separation of Concerns:** Structure, style, and behavior strictly separated
- **No Inline Code:** Never inline JS or CSS except critical styles in `<head>`
- **Token-First Design:** Color, spacing, typography via CSS variables
- **Reusable Components:** Template fragments without templating engine
- **Accessibility Mandatory:** Label inputs, use focus outlines, test keyboard navigation
- **SEO Ready:** Include meta, Open Graph, and structured data in `<head>`
- **Optimized Images:** Use AVIF/WebP with defined width/height
- **No Flex-Wrap:** Use scroll-x utilities for overflow instead

## Implementation Guidelines

### HTML Structure
- Use semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`)
- Add ARIA labels and roles where semantic HTML is insufficient
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Include skip links for keyboard navigation

### CSS Organization
- Load tokens.css first, then reset, layout, components, utilities
- Never hardcode colors or spacing values
- Use CSS custom properties for theming
- Follow mobile-first breakpoint strategy

### JavaScript Patterns
- Use ES modules with `type="module"`
- Keep scripts dependency-light
- Prefer native Web APIs over libraries
- Comment intent behind DOM manipulation

## Development Commands

```bash
# Python server
python -m http.server 8080

# Node.js server
npx http-server -p 8080 -c-1

# Live reload (optional)
npx browser-sync start --server --files "**/*" --no-notify
```

## Validation Checklist

```bash
npx html-validate "**/*.html"
npx stylelint "**/*.css" --fix
npx eslint "**/*.js" --fix
npx lighthouse http://localhost:8080 --view
```

## Deployment

- Works out-of-box (no build step required)
- Publish root directory directly to hosting
- Set cache headers for `/assets`, `/styles`, `/scripts`
- Enable gzip/Brotli compression at server level
- Verify Lighthouse ≥ 90 (Performance, SEO, Accessibility)

## Philosophy

**OKLCH-driven design, zero build complexity, and fully modular HTML.**

Lightweight, structured, and timeless. Simple by default, beautiful by design, production-ready always.

## Additional Resources

See `resources/` directory for:
- Component templates (card, modal, layout patterns)
- Token setup examples
- Accessibility patterns
- CDN configuration
