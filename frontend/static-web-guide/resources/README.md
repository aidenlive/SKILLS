# Static Web Guide Resources

This directory contains production-ready HTML, CSS, and JavaScript templates for building modular static web projects with zero build step.

## Files

### `base-template.html`
Complete HTML5 template with semantic markup, ARIA labels, SEO meta tags, and accessibility features.

**Includes:**
- Proper document structure
- Meta tags (SEO, Open Graph, Twitter Card)
- Structured data (JSON-LD)
- Skip links for accessibility
- Navigation with horizontal scroll
- Hero section
- Feature cards
- Sidebar layout
- Footer with social links
- Theme switcher integration

**Usage:**
```bash
# Copy to your project root
cp resources/base-template.html index.html

# Customize:
# - Update meta tags
# - Replace placeholder content
# - Add your branding
# - Connect to your stylesheets
```

### `starter-styles.css`
Complete CSS foundation with tokens, reset, layout patterns, and components.

**Includes:**
- Design tokens (OKLCH colors, spacing, typography)
- Modern CSS reset
- Layout utilities (container, stack, cluster, grid)
- Basic components (button, card, input)
- Utility classes
- Dark mode support
- Accessibility styles (skip link, sr-only, focus-visible)

**Usage:**
```bash
# Split into separate files:
# /styles/tokens.css
# /styles/reset.css
# /styles/layout.css
# /styles/components.css
# /styles/utilities.css

# Or use as a single file for small projects
cp resources/starter-styles.css styles/main.css
```

### `app-module.js`
ES Module with reusable JavaScript utilities and patterns for static web apps.

**Includes:**
- DOM helpers (query selectors, event delegation, element creation)
- Theme switcher with localStorage persistence
- Mobile navigation with accessibility
- Modal dialog with focus trap
- Form validation (client-side)
- Toast notifications
- Fetch wrapper for JSON API calls
- Auto-initialization

**Usage:**
```html
<script type="module" src="/scripts/app.js"></script>

<script type="module">
  import { Modal, Toast, fetchJSON } from '/scripts/app.js';

  // Use modal
  const modal = new Modal('my-modal');
  document.querySelector('[data-modal-open]').addEventListener('click', () => {
    modal.open();
  });

  // Show toast
  const toast = new Toast();
  toast.success('Operation completed!');

  // Fetch data
  const data = await fetchJSON('/data/config.json');
</script>
```

## Quick Start

### 1. Create Project Structure

```bash
mkdir my-static-site
cd my-static-site

# Create directories
mkdir -p styles scripts data assets/images assets/icons

# Copy resources
cp resources/base-template.html index.html
cp resources/starter-styles.css styles/main.css
cp resources/app-module.js scripts/app.js
```

### 2. Setup HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Static Site</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Icons -->
  <script src="https://unpkg.com/@phosphor-icons/web"></script>

  <!-- Styles -->
  <link rel="stylesheet" href="/styles/main.css">

  <title>My Site</title>
</head>
<body>
  <main id="main-content">
    <h1>Hello World</h1>
  </main>

  <script type="module" src="/scripts/app.js"></script>
</body>
</html>
```

### 3. Run Development Server

```bash
# Python (built-in)
python -m http.server 8080

# Node.js (via npx)
npx http-server -p 8080 -c-1

# With live reload
npx browser-sync start --server --files "**/*" --no-notify
```

### 4. Open in Browser

Visit `http://localhost:8080`

## Project Structure

Recommended folder structure for static projects:

```
my-static-site/
├── index.html
├── about.html
├── contact.html
├── /styles
│   ├── tokens.css        # Design tokens (colors, spacing, typography)
│   ├── reset.css         # CSS reset
│   ├── layout.css        # Layout utilities (container, grid, stack)
│   ├── components.css    # UI components (button, card, modal)
│   └── utilities.css     # Utility classes
├── /scripts
│   ├── app.js            # Main app module
│   └── ui-helpers.js     # Additional utilities
├── /data
│   ├── config.json       # Configuration
│   └── content.json      # Dynamic content
├── /assets
│   ├── /images           # Images (AVIF, WebP, PNG, JPG)
│   └── /icons            # Icons and logos
└── /docs
    └── README.md         # Documentation
```

## CSS Loading Order

Always load CSS files in this order:

```html
<link rel="stylesheet" href="/styles/tokens.css">    <!-- 1. Tokens first -->
<link rel="stylesheet" href="/styles/reset.css">     <!-- 2. Reset -->
<link rel="stylesheet" href="/styles/layout.css">    <!-- 3. Layout -->
<link rel="stylesheet" href="/styles/components.css"><!-- 4. Components -->
<link rel="stylesheet" href="/styles/utilities.css"> <!-- 5. Utilities last -->
```

## Common Patterns

### Navigation (No Flex-Wrap)

```html
<nav class="nav-primary">
  <ul class="cluster" role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

### Modal Dialog

```html
<!-- Trigger -->
<button data-modal-open="example-modal">Open Modal</button>

<!-- Modal -->
<div id="example-modal" class="modal" aria-hidden="true">
  <div class="modal-overlay"></div>
  <div class="modal-content" role="dialog" aria-labelledby="modal-title">
    <button data-modal-close aria-label="Close modal">×</button>
    <h2 id="modal-title">Modal Title</h2>
    <p>Modal content here</p>
  </div>
</div>

<script type="module">
  import { Modal } from '/scripts/app.js';
  const modal = new Modal('example-modal');

  document.querySelector('[data-modal-open]').addEventListener('click', () => {
    modal.open();
  });
</script>
```

### Form with Validation

```html
<form id="contact-form">
  <div>
    <label for="name">Name</label>
    <input
      type="text"
      id="name"
      required
      minlength="2"
      aria-required="true">
  </div>

  <div>
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      required
      aria-required="true">
  </div>

  <button type="submit" class="btn btn-primary">Submit</button>
</form>

<script type="module">
  import { FormValidator } from '/scripts/app.js';
  new FormValidator('#contact-form');
</script>
```

### Toast Notifications

```html
<script type="module">
  import { Toast } from '/scripts/app.js';

  const toast = new Toast();

  // Success
  toast.success('Saved successfully!');

  // Error
  toast.error('Something went wrong');

  // Warning
  toast.warning('Are you sure?');

  // Info
  toast.info('New updates available');
</script>
```

### Theme Switcher

```html
<button data-theme-toggle aria-label="Toggle theme">
  <i class="ph ph-sun" aria-hidden="true"></i>
</button>

<script type="module">
  import { ThemeSwitcher } from '/scripts/app.js';

  const theme = new ThemeSwitcher();

  // Toggle theme
  document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
    theme.toggle();
  });

  // Listen for theme changes
  window.addEventListener('themechange', (e) => {
    console.log('Theme changed to:', e.detail.theme);
  });
</script>
```

### Fetch JSON Data

```html
<script type="module">
  import { fetchJSON } from '/scripts/app.js';

  async function loadData() {
    try {
      const data = await fetchJSON('/data/products.json');
      console.log(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  loadData();
</script>
```

## Accessibility Checklist

- [x] Skip links for keyboard navigation
- [x] Semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`)
- [x] ARIA labels where needed
- [x] Focus visible styles
- [x] Keyboard navigation support
- [x] Screen reader friendly markup
- [x] Alt text for images
- [x] Form labels and error messages
- [x] Sufficient color contrast (WCAG AA)
- [x] Responsive text sizing

## SEO Checklist

- [x] Semantic HTML structure
- [x] Meta description (155 characters max)
- [x] Open Graph tags (social sharing)
- [x] Twitter Card meta tags
- [x] Structured data (JSON-LD)
- [x] Descriptive page titles
- [x] Heading hierarchy (h1 → h2 → h3)
- [x] Alt text for images
- [x] Sitemap.xml
- [x] Robots.txt

## Performance Optimization

### Images
```html
<!-- Modern image formats with fallbacks -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" width="800" height="450" loading="lazy">
</picture>
```

### Fonts
```html
<!-- Preconnect to font CDN -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load with display=swap -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
```

### Critical CSS
```html
<style>
  /* Inline critical above-the-fold CSS */
  body { font-family: sans-serif; margin: 0; }
  .hero { min-height: 100vh; }
</style>
```

## Validation & Testing

### HTML Validation
```bash
npx html-validate "**/*.html"
```

### CSS Validation
```bash
npx stylelint "**/*.css" --fix
```

### JavaScript Linting
```bash
npx eslint "**/*.js" --fix
```

### Lighthouse Audit
```bash
npx lighthouse http://localhost:8080 --view
```

## Deployment

### Static Hosts
- **Netlify**: Drag and drop or Git integration
- **Vercel**: Zero-config deployment
- **GitHub Pages**: Push to `gh-pages` branch
- **Cloudflare Pages**: Fast global CDN
- **Surge**: Simple CLI deployment

### Netlify Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

### GitHub Pages
```bash
# Push to gh-pages branch
git checkout -b gh-pages
git push origin gh-pages
```

### Simple FTP
```bash
# Upload entire directory via FTP/SFTP
# Set cache headers for static assets:
# /assets: 1 year
# /styles, /scripts: 1 month
# HTML: no-cache
```

## Best Practices

### DO:
✅ Use semantic HTML elements
✅ Separate concerns (HTML, CSS, JS in separate files)
✅ Use CSS custom properties for theming
✅ Follow mobile-first approach
✅ Add skip links and ARIA labels
✅ Optimize images (AVIF/WebP)
✅ Use ES modules (`type="module"`)
✅ Test with Lighthouse

### DON'T:
❌ Inline CSS or JavaScript (except critical styles)
❌ Hardcode colors or spacing
❌ Use `flex-wrap: wrap`
❌ Forget alt text on images
❌ Skip accessibility testing
❌ Use heavy JavaScript frameworks
❌ Ignore browser compatibility

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox required
- ES Modules support required
- OKLCH color space (with fallbacks for older browsers)
- Graceful degradation for older browsers

## Related Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)
- [Can I Use](https://caniuse.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Phosphor Icons](https://phosphoricons.com/)

## Tips

1. **Start simple** - Copy base template, customize incrementally
2. **Use tokens** - Never hardcode colors or spacing
3. **Test early** - Run Lighthouse from the start
4. **Stay semantic** - Use proper HTML elements
5. **Think mobile-first** - Design for 320px, scale up
6. **Keep it modular** - Break CSS and JS into logical files
7. **Document decisions** - Add comments explaining "why"
