# Performance Audit Resources

Production-ready tools for performance optimization, Core Web Vitals monitoring, and bundle analysis.

---

## Contents

1. **lighthouse-config.js** - Lighthouse CI configuration for automated performance testing
2. **bundle-analyzer.js** - Bundle size analyzer with compression metrics
3. **image-optimizer.js** - Batch image optimizer for modern formats (AVIF/WebP)
4. **web-vitals-monitor.js** - Real-time Core Web Vitals monitoring
5. **README.md** - This file

---

## Quick Start

### 1. Lighthouse CI (Automated Performance Testing)

The `lighthouse-config.js` file provides comprehensive Lighthouse CI configuration for CI/CD pipelines.

**Installation:**
```bash
npm install -g @lhci/cli
```

**Usage:**
```bash
# Copy config to your project
cp lighthouse-config.js lighthouserc.js

# Run Lighthouse CI
lhci autorun

# View results
open ./lhci-reports/index.html
```

**What's included:**
- ✅ Performance budgets (LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1)
- ✅ Resource size limits (JS ≤ 200KB, CSS ≤ 50KB)
- ✅ Accessibility and SEO checks
- ✅ Best practices validation
- ✅ Mobile and desktop testing
- ✅ CI/CD integration examples

**Performance Budgets:**
```javascript
// Core Web Vitals
'first-contentful-paint': ['error', { maxNumericValue: 1800 }],  // 1.8s
'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],   // 0.1

// Bundle sizes
'resource-summary:script:size': ['error', { maxNumericValue: 200000 }], // 200KB
'resource-summary:stylesheet:size': ['error', { maxNumericValue: 50000 }], // 50KB
```

**CI/CD Integration (GitHub Actions):**
```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

---

### 2. Bundle Analyzer

The `bundle-analyzer.js` script analyzes your build output and provides detailed size metrics.

**Installation:**
```bash
# No dependencies - uses Node.js built-in modules
```

**Usage:**
```bash
# Analyze default dist/ directory
node bundle-analyzer.js

# Analyze custom directory
node bundle-analyzer.js ./build

# Add to package.json
npm pkg set scripts.analyze="node bundle-analyzer.js dist"
npm run analyze
```

**Features:**
- 📦 Analyzes JavaScript, CSS, images, fonts
- 📊 Shows raw, gzip, and Brotli sizes
- 🚨 Warns when bundles exceed thresholds
- 💡 Provides optimization recommendations
- 🎨 Color-coded output for easy scanning

**Example Output:**
```
📦 Bundle Size Analyzer

JavaScript Bundles:
────────────────────────────────────────────────────────────
app.js           150 KB → 45 KB (gzip) → 38 KB (br)
vendor.js        280 KB → 85 KB (gzip) → 72 KB (br)
────────────────────────────────────────────────────────────
TOTAL            430 KB → 130 KB (gzip) → 110 KB (br)

✅ JS bundle size looks good!
```

**Thresholds:**
- JS: Warning at 200KB, Error at 300KB (gzipped)
- CSS: Warning at 30KB, Error at 50KB (gzipped)

**Integration:**
```json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build && node bundle-analyzer.js dist"
  }
}
```

---

### 3. Image Optimizer

The `image-optimizer.js` script batch converts images to modern formats with responsive sizes.

**Installation:**
```bash
npm install sharp
```

**Usage:**
```bash
# Optimize images in default directory
node image-optimizer.js

# Custom input/output directories
node image-optimizer.js ./src/images ./public/optimized

# Watch for changes
npm pkg set scripts.optimize:watch="nodemon --watch images image-optimizer.js"
npm run optimize:watch
```

**Features:**
- 🖼️ Generates AVIF, WebP, and optimized JPEG/PNG
- 📱 Creates responsive sizes (400w, 800w, 1200w, 1600w)
- 🗜️ Best compression (AVIF ~60% smaller than JPEG)
- 📈 Shows before/after sizes and savings
- 📋 Generates responsive HTML examples

**Example Output:**
```
🖼️  Image Optimizer

Processing: hero.jpg
  Original: 1920x1080, 450 KB
  ✓ Generated 14 optimized versions
  Average size: 65 KB (85.6% smaller)
  AVIF: 55 KB (87.8% smaller)
  WebP: 72 KB (84.0% smaller)

═══════════════════════════════════════════════════
Summary
═══════════════════════════════════════════════════

Images processed: 5
Original total: 2.1 MB
Average savings: 380 KB per image (86.2%)

✓ Optimization complete!
```

**Generated HTML Example:**
```html
<picture>
  <source
    type="image/avif"
    srcset="hero-400w.avif 400w,
            hero-800w.avif 800w,
            hero-1200w.avif 1200w"
    sizes="(max-width: 640px) 400px,
           (max-width: 1024px) 800px,
           1200px"
  >
  <source
    type="image/webp"
    srcset="hero-400w.webp 400w,
            hero-800w.webp 800w,
            hero-1200w.webp 1200w"
    sizes="(max-width: 640px) 400px,
           (max-width: 1024px) 800px,
           1200px"
  >
  <img
    src="hero.jpg"
    alt="Description"
    width="1200"
    height="800"
    loading="lazy"
  >
</picture>
```

**Configuration:**
```javascript
// Adjust quality settings
const QUALITY = {
  avif: 65,   // 0-100 (lower = smaller file)
  webp: 80,   // 0-100
  jpeg: 85,   // 0-100
  png: 90,    // Compression level 0-9
};

// Responsive breakpoints
const RESPONSIVE_SIZES = [400, 800, 1200, 1600];
```

---

### 4. Web Vitals Monitor

The `web-vitals-monitor.js` module provides real-time Core Web Vitals monitoring in production.

**Installation:**
```bash
npm install web-vitals
```

**Basic Usage:**
```javascript
// main.js
import './web-vitals-monitor.js';

// Auto-initializes and reports to console (dev) and analytics (prod)
```

**Custom Configuration:**
```javascript
import initWebVitals, { showMetricsOverlay } from './web-vitals-monitor.js';

initWebVitals({
  debug: true,                          // Console logging
  analyticsEndpoint: '/api/web-vitals', // Analytics endpoint
  reportToAnalytics: true,              // Send to analytics
  samplingRate: 0.5,                    // Report 50% of sessions
});

// Show overlay in development
if (import.meta.env.DEV) {
  showMetricsOverlay();
}
```

**Features:**
- 📊 Monitors all Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
- 📈 Real-time console logging (development)
- 📡 Sends metrics to analytics (production)
- 🎨 Visual overlay for development
- ⚡ Integration with Google Analytics 4
- 🔔 Custom event dispatching

**Monitored Metrics:**

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | ≤ 2.5s | Largest Contentful Paint |
| **FID** | ≤ 100ms | First Input Delay (deprecated) |
| **INP** | ≤ 200ms | Interaction to Next Paint |
| **CLS** | ≤ 0.1 | Cumulative Layout Shift |
| **FCP** | ≤ 1.8s | First Contentful Paint |
| **TTFB** | ≤ 800ms | Time to First Byte |

**Listen to Metrics:**
```javascript
window.addEventListener('web-vitals', (event) => {
  const { name, value, rating } = event.detail;
  console.log(`${name}: ${value}ms (${rating})`);

  // Send to your analytics
  analytics.track('Web Vital', {
    metric: name,
    value: value,
    rating: rating,
  });
});
```

**Monitor Long Tasks:**
```javascript
import { monitorLongTasks } from './web-vitals-monitor.js';

// Warn if JavaScript blocks main thread for > 50ms
monitorLongTasks(50);
```

**Get Current Metrics:**
```javascript
import { getCurrentMetrics } from './web-vitals-monitor.js';

const metrics = await getCurrentMetrics();
console.log('Current Web Vitals:', metrics);
// {
//   LCP: { value: 1250, rating: 'good', formatted: '1250ms' },
//   CLS: { value: 0.05, rating: 'good', formatted: '0.050' },
//   ...
// }
```

**Analytics Backend Example:**
```javascript
// Express.js endpoint
app.post('/api/web-vitals', (req, res) => {
  const { name, value, rating, url, userAgent } = req.body;

  // Store in database
  await analytics.record({
    metric: name,
    value,
    rating,
    url,
    userAgent,
    timestamp: new Date(),
  });

  res.sendStatus(200);
});
```

**Google Analytics 4 Integration:**
```javascript
// Automatically sends to GA4 if gtag is available
// No additional configuration needed

// Events sent:
// - event_category: 'Web Vitals'
// - event_label: metric ID
// - value: metric value
// - metric_rating: 'good' | 'needs-improvement' | 'poor'
```

---

## Integration Workflow

### Complete Performance Optimization Workflow

**1. Development Phase:**
```bash
# Monitor Web Vitals in real-time
import { initWebVitals, showMetricsOverlay } from './web-vitals-monitor.js';
initWebVitals({ debug: true });
showMetricsOverlay();
```

**2. Build Phase:**
```bash
# Optimize images before build
npm run optimize:images

# Build application
npm run build

# Analyze bundle
npm run analyze
```

**3. Pre-Deployment:**
```bash
# Run Lighthouse CI
lhci autorun

# Review reports
open ./lhci-reports/index.html

# Fix any issues before deployment
```

**4. Production Monitoring:**
```javascript
// main.js
import initWebVitals from './web-vitals-monitor.js';

initWebVitals({
  reportToAnalytics: true,
  analyticsEndpoint: '/api/web-vitals',
  samplingRate: 0.1, // 10% of users
});
```

**5. Continuous Improvement:**
```bash
# Weekly bundle analysis
npm run build:analyze

# Monthly Lighthouse audits
npm run lighthouse

# Track Web Vitals trends in analytics dashboard
```

---

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build && node resources/bundle-analyzer.js dist",

    "optimize:images": "node resources/image-optimizer.js",
    "optimize:images:watch": "nodemon --watch public/images resources/image-optimizer.js",

    "lighthouse": "lhci autorun",
    "lighthouse:mobile": "lhci autorun --collect.settings.preset=mobile",
    "lighthouse:desktop": "lhci autorun --collect.settings.preset=desktop",
    "lighthouse:view": "open ./lhci-reports/index.html",

    "perf:all": "npm run optimize:images && npm run build:analyze && npm run lighthouse"
  }
}
```

---

## Performance Checklist

Use this checklist before deploying:

### Bundle Optimization
- [ ] Total JS bundle ≤ 200KB (gzipped)
- [ ] Total CSS bundle ≤ 50KB (gzipped)
- [ ] Code splitting implemented
- [ ] Tree shaking enabled
- [ ] No unused dependencies

### Image Optimization
- [ ] All images optimized (AVIF/WebP)
- [ ] Responsive images with srcset
- [ ] Lazy loading for below-fold images
- [ ] Width/height attributes set (prevent CLS)
- [ ] Hero images preloaded

### Core Web Vitals
- [ ] LCP ≤ 2.5s
- [ ] FID/INP ≤ 100ms/200ms
- [ ] CLS ≤ 0.1
- [ ] FCP ≤ 1.8s
- [ ] TTFB ≤ 800ms

### Caching
- [ ] Static assets have cache headers
- [ ] Service Worker implemented
- [ ] API responses cached appropriately

### Monitoring
- [ ] Web Vitals tracking in production
- [ ] Lighthouse CI in deployment pipeline
- [ ] Performance budget enforcement
- [ ] Analytics dashboard configured

---

## Troubleshooting

### Lighthouse CI Fails

**Issue:** Lighthouse CI fails with budget exceeded

**Solution:**
```bash
# 1. View detailed report
open ./lhci-reports/index.html

# 2. Run Lighthouse manually for debugging
npx lighthouse http://localhost:3000 --view

# 3. Identify specific issues
# 4. Fix issues (code splitting, image optimization, etc.)
# 5. Re-run Lighthouse CI
```

### Bundle Analyzer Shows Large Files

**Issue:** JavaScript bundle > 300KB

**Solution:**
```bash
# 1. Use Vite bundle visualizer
npm install -D rollup-plugin-visualizer
npx vite-bundle-visualizer

# 2. Identify large dependencies
# 3. Consider alternatives or lazy loading
# 4. Use dynamic imports for large features

# Example:
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Poor Core Web Vitals in Production

**Issue:** LCP > 4s in production

**Solution:**
```javascript
// 1. Check Web Vitals details
window.addEventListener('web-vitals', (e) => {
  if (e.detail.name === 'LCP' && e.detail.value > 2500) {
    console.log('LCP element:', e.detail);
  }
});

// 2. Optimize LCP element
// - Preload hero images
// - Remove render-blocking resources
// - Reduce server response time

// 3. Test with slow 3G throttling
// Chrome DevTools > Network > Slow 3G
```

### Images Not Optimizing

**Issue:** Image optimizer fails or produces large files

**Solution:**
```bash
# 1. Check Sharp installation
npm install sharp

# 2. Verify input format is supported
# Supported: .jpg, .jpeg, .png, .webp, .avif, .tiff

# 3. Adjust quality settings
# Edit QUALITY constants in image-optimizer.js

# 4. Check for corrupted images
npx sharp-cli info image.jpg
```

---

## Best Practices

### 1. Regular Monitoring

Run performance audits regularly:
- **Daily:** Monitor Web Vitals in production
- **Weekly:** Run bundle analyzer after significant changes
- **Monthly:** Full Lighthouse audit on all pages
- **Per PR:** Lighthouse CI in CI/CD pipeline

### 2. Performance Budgets

Set and enforce budgets:
```javascript
// lighthouserc.js
'resource-summary:script:size': ['error', { maxNumericValue: 200000 }],
'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
```

### 3. Image Optimization Strategy

- Always use modern formats (AVIF primary, WebP fallback)
- Generate responsive sizes for all images
- Lazy load below-fold images
- Preload critical above-fold images

### 4. Code Splitting

```javascript
// Split by route
const Dashboard = lazy(() => import('./Dashboard'));

// Split by feature
button.addEventListener('click', async () => {
  const { Modal } = await import('./Modal');
  new Modal().open();
});

// Split by condition
if (userIsAdmin) {
  const { AdminPanel } = await import('./AdminPanel');
}
```

### 5. Continuous Optimization

Performance is not a one-time task:
1. Monitor metrics continuously
2. Set up alerts for regressions
3. Review analytics weekly
4. Optimize based on real user data
5. Test on real devices and networks

---

## Additional Resources

- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Web Vitals:** https://web.dev/vitals/
- **Sharp:** https://sharp.pixelplumbing.com/
- **Bundle Optimization:** https://web.dev/reduce-javascript-payloads-with-code-splitting/
- **Image Optimization:** https://web.dev/fast/#optimize-your-images

---

## Support

For questions or issues:
1. Review this README and inline code documentation
2. Check troubleshooting section above
3. Consult main SKILL.md in parent directory
4. Review official Web Vitals documentation

---

**Remember: Performance is a feature, not an afterthought.**

*Every millisecond counts. Optimize ruthlessly.*
