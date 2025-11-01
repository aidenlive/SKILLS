---
name: performance-audit
description: Performance optimization covering bundle size, lazy loading, image optimization, and Core Web Vitals. Use when optimizing applications, preparing for deployment, or auditing performance metrics.
version: 1.0.0
---

# Performance Optimization Guide

## Purpose

Implement performance optimization strategies covering bundle size, lazy loading, image optimization, and Core Web Vitals. Fast, efficient web applications with excellent user experience.

## When to Use This Skill

- Optimizing application performance
- Preparing for production deployment
- Auditing performance metrics
- Improving Core Web Vitals scores
- Reducing bundle size and load times

## Core Web Vitals

### Three Key Metrics

**LCP (Largest Contentful Paint)**
- **Target:** ≤ 2.5 seconds
- **Measures:** Loading performance
- **Affects:** User perception of load speed

**FID (First Input Delay) / INP (Interaction to Next Paint)**
- **Target:** ≤ 100ms (FID) / ≤ 200ms (INP)
- **Measures:** Interactivity
- **Affects:** User perception of responsiveness

**CLS (Cumulative Layout Shift)**
- **Target:** ≤ 0.1
- **Measures:** Visual stability
- **Affects:** User experience during page load

### Additional Metrics

**FCP (First Contentful Paint)**
- **Target:** ≤ 1.8 seconds
- **Measures:** Time to first visible content

**TTFB (Time to First Byte)**
- **Target:** ≤ 600ms
- **Measures:** Server response time

**TTI (Time to Interactive)**
- **Target:** ≤ 3.8 seconds
- **Measures:** Time until page is fully interactive

## Bundle Optimization

### Code Splitting

**React with Vite:**
```javascript
// Lazy load routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

**Dynamic Imports:**
```javascript
// Load on demand
button.addEventListener('click', async () => {
  const { default: Modal } = await import('./components/Modal');
  const modal = new Modal();
  modal.open();
});
```

### Tree Shaking

**Enable in Vite:**
```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
};
```

**Import Only What You Need:**
```javascript
// ❌ Import entire library
import _ from 'lodash';

// ✅ Import specific function
import debounce from 'lodash/debounce';

// ✅ Even better - use native
const debounce = (fn, ms) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};
```

### Bundle Analysis

```bash
# Vite
npm run build
npx vite-bundle-visualizer

# Webpack
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json
```

### Target Bundle Sizes

- **Initial JS:** ≤ 200 KB (compressed)
- **Initial CSS:** ≤ 50 KB (compressed)
- **Total Initial:** ≤ 250 KB (compressed)

## Image Optimization

### Modern Formats

**Use AVIF/WebP:**
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### Responsive Images
```html
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 640px) 400px,
         (max-width: 1024px) 800px,
         1200px"
  alt="Description"
  width="800"
  height="600"
  loading="lazy"
>
```

### Lazy Loading
```html
<!-- Native lazy loading -->
<img src="image.jpg" alt="Description" loading="lazy">

<!-- For LCP image, load eagerly -->
<img src="hero.jpg" alt="Hero" loading="eager" fetchpriority="high">
```

### Image Sizing

**Always Set Dimensions:**
```html
<!-- ✅ Prevents layout shift -->
<img
  src="image.jpg"
  alt="Description"
  width="800"
  height="600"
>

<!-- ❌ Causes layout shift -->
<img src="image.jpg" alt="Description">
```

### Optimization Tools
```bash
# Squoosh CLI
npx @squoosh/cli --avif '{"cqLevel": 33}' images/*.jpg

# Sharp (Node.js)
npm install sharp
```

```javascript
import sharp from 'sharp';

await sharp('input.jpg')
  .resize(800)
  .avif({ quality: 80 })
  .toFile('output.avif');
```

## Asset Loading Strategies

### Preload Critical Resources
```html
<!-- Preload fonts -->
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossorigin
>

<!-- Preload critical CSS -->
<link
  rel="preload"
  href="/styles/critical.css"
  as="style"
>

<!-- Preload hero image -->
<link
  rel="preload"
  href="/images/hero.avif"
  as="image"
  type="image/avif"
>
```

### DNS Prefetch and Preconnect
```html
<!-- DNS prefetch for external domains -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- Preconnect for critical third-party -->
<link rel="preconnect" href="https://api.example.com">
```

### Defer Non-Critical Scripts
```html
<!-- Critical inline script -->
<script>
  // Theme initialization
  const theme = localStorage.getItem('theme');
  if (theme) document.documentElement.setAttribute('data-theme', theme);
</script>

<!-- Defer everything else -->
<script src="/app.js" defer></script>

<!-- Async for independent scripts -->
<script src="/analytics.js" async></script>
```

## CSS Optimization

### Critical CSS Inline
```html
<head>
  <style>
    /* Critical above-the-fold CSS */
    body { margin: 0; font-family: Inter, sans-serif; }
    .header { background: #fff; padding: 1rem; }
  </style>

  <!-- Load full CSS async -->
  <link
    rel="preload"
    href="/styles/main.css"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  >
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
</head>
```

### Minimize CSS
```css
/* ❌ Overly specific selectors */
.header .nav .nav-list .nav-item a {
  color: blue;
}

/* ✅ Flatter specificity */
.nav-link {
  color: blue;
}

/* ✅ Use CSS variables */
:root {
  --color-link: blue;
}

.nav-link {
  color: var(--color-link);
}
```

### Remove Unused CSS
```bash
# PurgeCSS
npx purgecss --css styles.css --content index.html --output dist/
```

## JavaScript Optimization

### Defer Execution
```javascript
// ❌ Blocking operation on load
window.addEventListener('load', () => {
  // Heavy computation
  processData();
});

// ✅ Defer to idle time
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    processData();
  });
} else {
  setTimeout(() => processData(), 1);
}
```

### Web Workers for Heavy Tasks
```javascript
// main.js
const worker = new Worker('/worker.js');

worker.postMessage({ data: largeDataset });

worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = processLargeDataset(e.data);
  self.postMessage(result);
};
```

### Memoization
```javascript
// React
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  const processed = useMemo(() => {
    return expensiveComputation(data);
  }, [data]);

  return <div>{processed}</div>;
}

// Vanilla JS
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```

## Caching Strategies

### Service Worker Caching
```javascript
// sw.js
const CACHE_NAME = 'v1';
const ASSETS = [
  '/',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### HTTP Caching Headers
```
# Static assets (immutable)
Cache-Control: public, max-age=31536000, immutable

# HTML (always revalidate)
Cache-Control: no-cache

# API responses (short cache)
Cache-Control: public, max-age=60, must-revalidate
```

## Rendering Strategies

### Static Generation (Best Performance)
```javascript
// Next.js
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}
```

### Server-Side Rendering
```javascript
// Next.js
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}
```

### Incremental Static Regeneration
```javascript
// Next.js
export async function getStaticProps() {
  return {
    props: { data },
    revalidate: 60, // Regenerate after 60 seconds
  };
}
```

## Preventing Layout Shifts (CLS)

### Reserve Space for Content
```css
/* Reserve space for images */
.image-container {
  aspect-ratio: 16 / 9;
  background: var(--gray-4);
}

/* Reserve space for ads */
.ad-slot {
  min-height: 250px;
  background: var(--gray-4);
}
```

### Font Loading Strategy
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* or 'optional' for better CLS */
}
```

### Avoid Dynamic Content Insertion
```javascript
// ❌ Causes layout shift
element.innerHTML = dynamicContent;

// ✅ Reserve space first
element.style.minHeight = '200px';
element.innerHTML = dynamicContent;
```

## Performance Monitoring

### Lighthouse CI
```bash
# Install
npm install -g @lhci/cli

# Run
lhci autorun --collect.url=http://localhost:3000
```

### Web Vitals Library
```javascript
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
```

### Performance Observer
```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.startTime, entry);
  }
});

observer.observe({ entryTypes: ['largest-contentful-paint'] });
```

## Optimization Checklist

### Initial Load
- [ ] Bundle size ≤ 250 KB (gzipped)
- [ ] Critical CSS inlined
- [ ] Fonts preloaded
- [ ] Images optimized (AVIF/WebP)
- [ ] Scripts deferred/async

### Runtime
- [ ] Lazy load below-fold content
- [ ] Use Web Workers for heavy tasks
- [ ] Implement virtual scrolling for long lists
- [ ] Debounce/throttle expensive operations
- [ ] Memoize expensive computations

### Caching
- [ ] Service Worker implemented
- [ ] Static assets have long cache headers
- [ ] API responses cached appropriately

### Metrics
- [ ] LCP ≤ 2.5s
- [ ] FID/INP ≤ 100ms/200ms
- [ ] CLS ≤ 0.1
- [ ] Lighthouse score ≥ 90

## Common Performance Issues

### Large JavaScript Bundles
**Solution:** Code splitting, tree shaking, lazy loading

### Render-Blocking Resources
**Solution:** Defer non-critical scripts, inline critical CSS

### Large Images
**Solution:** Modern formats, responsive images, lazy loading

### Poor Caching
**Solution:** Service Workers, proper cache headers

### Layout Shifts
**Solution:** Reserve space, use aspect-ratio, font-display

## Testing Tools

```bash
# Lighthouse
npx lighthouse http://localhost:3000 --view

# WebPageTest
# Use https://www.webpagetest.org/

# Bundle analyzer
npx vite-bundle-visualizer
```

## Philosophy

**Every millisecond matters. Optimize ruthlessly.**

Fast by default, optimized for real-world conditions, monitored continuously.

## Additional Resources

See `resources/` directory for:
- Performance budgets
- Optimization strategies
- Caching patterns
- Monitoring setup
