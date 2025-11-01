# AGENTS.md — React + Vite Frontend

## Purpose

Defines standards for React + Vite applications with OKLCH tokens, strict modularity, and mobile-first design.

**Goal:** fast, accessible, component-driven interfaces with zero visual bloat.

## Stack & Conventions

- React 18+ with functional components and hooks
- Vite bundler with ES modules
- CSS variables with OKLCH color tokens from `/shared/tokens.json`
- Inter + JetBrains Mono fonts; Phosphor icons via CDN
- Mobile-first layouts (320–1440px); no flex-wrap — use scroll or truncation
- Testing: Vitest + React Testing Library
- UTF-8 encoding, LF endings, 2-space indent

## Structure

```
/src
 ├─ /components (Button, Card, Modal, Layout)
 ├─ /pages (Home, Dashboard, Settings)
 ├─ /hooks (useAuth, useFetch, useTheme)
 ├─ /styles (tokens.css, reset.css, layout.css, components.css)
 ├─ /utils (formatters, validators, api-client)
 ├─ /assets (/images, /icons)
 ├─ App.jsx, main.jsx
/public (manifest.json, robots.txt, favicon)
/tests
/docs
```

## Authoring Rules

- Components: small, pure, composable — one responsibility per file
- Co-locate styles; never hardcode colors (use semantic CSS variables)
- Accessibility mandatory: labels, ARIA, focus order, keyboard navigation
- Lazy-load routes; memoize expensive operations with `useMemo`/`useCallback`
- Token-first design: spacing, typography, motion via variables
- Use AVIF/WebP images with defined width/height
- No flex-wrap anywhere; use scroll-x utilities for overflow
- Include meta tags, OG tags, and structured data in index.html

## Agent Behavior

- Scoped edits only; preserve component structure and naming
- Extend tokens or utility hooks instead of duplicating logic
- Keep dependencies minimal; document and justify new packages
- Update tests and Storybook stories on every component change
- Comment intent behind state management or complex hooks

## Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` with HMR enabled.

Optional type checking:

```bash
npm run type-check
```

## Validation

```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Vitest
npm run test:coverage # Coverage report
npm run build         # Production build
npx lighthouse http://localhost:5173 --view
```

## Deployment

```bash
npm run build
```

Outputs to `/dist` directory. Publish via Coolify Static Build Pack.

- Set cache headers for `/assets`
- Enable gzip/Brotli compression
- Verify Lighthouse ≥ 90 (Performance, SEO, Accessibility)

## Version Control

- **Branches:** main / feature/* / fix/* / docs/*
- **Commits:** imperative, one logical change per commit
- Include accessibility + performance validation before PR merge

## Philosophy

Component-driven, token-first, and relentlessly accessible.

**OKLCH-driven design, minimal bundle size, and production-ready always.**

Fast by default, beautiful by design, scalable through modularity.