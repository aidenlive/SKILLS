---
name: react-vite-guide
description: Standards for React + Vite applications with OKLCH tokens, functional components, hooks patterns, and mobile-first design. Use when building React applications, SPAs, or component-driven UIs with modern tooling.
version: 1.0.0
---

# React + Vite Frontend Guide

## Purpose

Define standards for React + Vite applications with OKLCH tokens, strict modularity, and mobile-first design. Fast, accessible, component-driven interfaces with zero visual bloat.

## When to Use This Skill

- Building React applications or single-page applications
- Creating component-driven user interfaces
- Developing with Vite bundler and modern React patterns
- Implementing functional components and hooks
- Working with mobile-first responsive designs

## Stack & Conventions

- React 18+ with functional components and hooks
- Vite bundler with ES modules
- CSS variables with OKLCH color tokens from `/shared/tokens.json`
- Inter + JetBrains Mono fonts; Phosphor icons via CDN
- Mobile-first layouts (320–1440px); no flex-wrap — use scroll or truncation
- Testing: Vitest + React Testing Library
- UTF-8 encoding, LF endings, 2-space indent

## Project Structure

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

- **Component Design:** Small, pure, composable — one responsibility per file
- **Co-Located Styles:** Never hardcode colors (use semantic CSS variables)
- **Accessibility Mandatory:** Labels, ARIA, focus order, keyboard navigation
- **Performance:** Lazy-load routes; memoize with `useMemo`/`useCallback`
- **Token-First Design:** Spacing, typography, motion via variables
- **Optimized Media:** Use AVIF/WebP images with defined width/height
- **No Flex-Wrap:** Use scroll-x utilities for overflow
- **SEO Ready:** Meta tags, OG tags, structured data in index.html

## Component Patterns

### Functional Components
```jsx
export function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
}
```

### Custom Hooks
```jsx
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch logic
  }, [url]);

  return { data, loading, error };
}
```

### Memoization
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Use `React.memo` for pure presentational components

## Development Commands

```bash
npm install
npm run dev              # Start dev server on http://localhost:5173
npm run type-check       # TypeScript validation (optional)
```

## Validation Checklist

```bash
npm run lint             # ESLint
npm run format           # Prettier
npm run test             # Vitest
npm run test:coverage    # Coverage report
npm run build            # Production build
npx lighthouse http://localhost:5173 --view
```

## Deployment

```bash
npm run build            # Outputs to /dist
```

Deploy via hosting platform:
- Set cache headers for `/assets`
- Enable gzip/Brotli compression
- Verify Lighthouse ≥ 90 (Performance, SEO, Accessibility)

## Best Practices

- **State Management:** Lift state only when needed; prefer local state
- **Error Boundaries:** Wrap route components for graceful error handling
- **Code Splitting:** Use dynamic imports for large components
- **Testing:** Write tests for all interactive components
- **Documentation:** Comment complex hooks and state logic

## Philosophy

**OKLCH-driven design, minimal bundle size, and production-ready always.**

Component-driven, token-first, and relentlessly accessible. Fast by default, beautiful by design, scalable through modularity.

## Additional Resources

See `resources/` directory for:
- Component templates (Button, Card, Modal, Layout)
- Custom hooks examples
- Routing patterns
- State management strategies
- Testing patterns
