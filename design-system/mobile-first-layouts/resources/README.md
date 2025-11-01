# Mobile-First Layouts Resources

This directory contains production-ready CSS for building mobile-first, responsive layouts with a 24-column grid system and strict no flex-wrap rule.

## Files

### `grid-system.css`
Complete 24-column grid system with responsive breakpoints, column spans, and container utilities.

**Features:**
- 24-column grid (divisible by 2, 3, 4, 6, 8, 12, 24)
- 4px spacing scale
- Responsive breakpoints (mobile, tablet, desktop, wide)
- Column spans and positioning
- Auto-fit grids for cards
- Container max-widths

**Usage:**
```html
<link rel="stylesheet" href="resources/grid-system.css">

<!-- Two-column layout -->
<div class="grid">
  <div class="col-24 col-md-12">Left Column</div>
  <div class="col-24 col-md-12">Right Column</div>
</div>

<!-- Asymmetric layout (2/3 + 1/3) -->
<div class="grid">
  <div class="col-24 col-md-16">Main Content</div>
  <div class="col-24 col-md-8">Sidebar</div>
</div>
```

### `layout-patterns.css`
Pre-built layout components following mobile-first principles with NO flex-wrap.

**Includes:**
- Stack (vertical spacing)
- Cluster (horizontal grouping, no wrap)
- Sidebar layout
- Reel (horizontal scroll carousel)
- Split layouts
- Card grids
- Navigation patterns
- Text truncation utilities

**Usage:**
```html
<link rel="stylesheet" href="resources/layout-patterns.css">

<!-- Stack layout -->
<div class="stack-lg">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>

<!-- Cluster (no wrap, scrolls horizontally) -->
<nav class="cluster">
  <a href="#">Home</a>
  <a href="#">Products</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>

<!-- Sidebar layout -->
<div class="sidebar-layout">
  <aside>Sidebar</aside>
  <main>Main Content</main>
</div>
```

### `responsive-examples.html`
Interactive demonstration page showcasing all layout patterns with live viewport indicator.

**Features:**
- Live responsive examples
- Viewport size indicator
- All layout patterns demonstrated
- Copy-paste ready HTML
- Visual grid examples

## Quick Start

### 1. Basic Setup

Include both stylesheets:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Mobile-First App</title>
  <link rel="stylesheet" href="resources/grid-system.css">
  <link rel="stylesheet" href="resources/layout-patterns.css">
</head>
<body>
  <!-- Your content here -->
</body>
</html>
```

### 2. Build a Responsive Page

```html
<div class="container-xl">
  <!-- Header -->
  <header class="stack-lg">
    <h1>Welcome</h1>
    <p>Mobile-first responsive layout</p>
  </header>

  <!-- Main grid -->
  <div class="grid grid-gap-6">
    <!-- Main content: Full width on mobile, 2/3 on desktop -->
    <main class="col-24 col-md-16">
      <div class="stack-md">
        <article class="card">Article 1</article>
        <article class="card">Article 2</article>
      </div>
    </main>

    <!-- Sidebar: Full width on mobile, 1/3 on desktop -->
    <aside class="col-24 col-md-8">
      <div class="card">Sidebar content</div>
    </aside>
  </div>
</div>
```

### 3. View Interactive Examples

Open `responsive-examples.html` and resize your browser to see:
- Grid system in action
- Layout pattern behavior
- Responsive breakpoints
- Viewport indicator

## Core Principles

### 1. Mobile First
Start with mobile (320px), scale up:

```css
/* Mobile: Default (no media query) */
.element {
  font-size: 14px;
}

/* Tablet: 640px+ */
@media (min-width: 640px) {
  .element {
    font-size: 16px;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .element {
    font-size: 18px;
  }
}
```

### 2. No Flex-Wrap Rule
**DON'T:**
```css
.nav {
  display: flex;
  flex-wrap: wrap; /* ❌ Unpredictable wrapping */
}
```

**DO:**
```css
.nav {
  display: flex;
  flex-wrap: nowrap; /* ✅ Scroll instead */
  overflow-x: auto;
}
```

### 3. 24-Column Grid
Flexible subdivisions:
- 2 columns: `col-12` (12 + 12)
- 3 columns: `col-8` (8 + 8 + 8)
- 4 columns: `col-6` (6 + 6 + 6 + 6)
- Asymmetric: `col-16` + `col-8` (2/3 + 1/3)

### 4. 4px Spacing Scale
All spacing uses 4px increments:
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
```

## Layout Patterns

### Stack (Vertical Spacing)
```html
<div class="stack-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Variants: stack-xs, stack-sm, stack-md, stack-lg, stack-xl -->
```

### Cluster (Horizontal, No Wrap)
```html
<div class="cluster">
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</div>

<!-- Items scroll horizontally on overflow -->
```

### Sidebar Layout
```html
<div class="sidebar-layout">
  <aside>Sidebar (250px on desktop)</aside>
  <main>Main content (flexible)</main>
</div>

<!-- Variants: sidebar-right, sidebar-wide, sidebar-narrow -->
```

### Reel (Horizontal Scroll)
```html
<div class="reel reel-smooth">
  <div style="width: 280px">Card 1</div>
  <div style="width: 280px">Card 2</div>
  <div style="width: 280px">Card 3</div>
</div>

<!-- Smooth scrolling with snap points -->
```

### Card Grid
```html
<div class="card-grid">
  <div class="card">Feature 1</div>
  <div class="card">Feature 2</div>
  <div class="card">Feature 3</div>
</div>

<!-- 1 column (mobile), 2 (tablet), 3 (desktop) -->
```

### Split Layout
```html
<div class="split">
  <div>Left 50%</div>
  <div>Right 50%</div>
</div>

<!-- Variants: split-7030, split-6040, split-4060 -->
```

## Breakpoint Reference

```css
/* Mobile Small: 320px - 479px (default) */
/* Mobile Large: 480px - 639px (default) */

/* Tablet: 640px+ */
@media (min-width: 640px) {
  .col-sm-12 { ... }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .col-md-12 { ... }
}

/* Wide: 1440px+ */
@media (min-width: 1440px) {
  .col-lg-12 { ... }
}
```

## Common Patterns

### Navigation (Scroll on Mobile)
```html
<nav class="cluster">
  <a href="#">Home</a>
  <a href="#">Products</a>
  <a href="#">Services</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>
```

### Responsive Form
```html
<form class="form-layout">
  <div>
    <label>First Name</label>
    <input type="text">
  </div>
  <div>
    <label>Last Name</label>
    <input type="text">
  </div>
  <div class="form-full">
    <label>Email</label>
    <input type="email">
  </div>
</form>

<!-- Stacks on mobile, 2 columns on tablet+ -->
```

### Data Table (Scroll on Mobile)
```html
<div class="table-container">
  <table class="table-responsive">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td>Active</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Scrolls horizontally on mobile -->
```

### Hero Section
```html
<section class="cover">
  <header>
    <h1>Hero Title</h1>
  </header>
  <div class="cover-centered">
    <p>Centered content</p>
    <button>Call to Action</button>
  </div>
  <footer>
    <p>Footer content</p>
  </footer>
</section>

<!-- Full height with centered content -->
```

## Overflow Handling

### Horizontal Scroll
```html
<div class="scroll-x">
  <div style="min-width: 800px;">
    Wide content scrolls horizontally
  </div>
</div>
```

### Text Truncation
```html
<!-- Single line -->
<p class="truncate">Long text gets ellipsis...</p>

<!-- Multi-line -->
<p class="line-clamp-3">
  Longer text clamped to 3 lines...
</p>
```

### Scroll Shadows (Indicate More Content)
```html
<div class="scroll-x scroll-shadows">
  <!-- Content with visual scroll indicators -->
</div>
```

## Responsive Utilities

### Show/Hide
```html
<div class="mobile-only">Visible on mobile</div>
<div class="desktop-only">Visible on desktop (1024px+)</div>
```

### Responsive Text
```html
<h1 class="text-lg sm:text-xl md:text-2xl">
  Responsive heading size
</h1>
```

### Responsive Gap
```html
<div class="grid grid-gap-4 grid-gap-md-8">
  <!-- Gap increases on desktop -->
</div>
```

## Customization

### Adjust Breakpoints
Edit in `grid-system.css`:

```css
:root {
  --viewport-mobile-sm: 320px;
  --viewport-mobile-lg: 480px;
  --viewport-tablet: 640px;
  --viewport-desktop: 1024px;
  --viewport-wide: 1440px;
}
```

### Modify Spacing Scale
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  /* Add custom spacing */
  --space-5: 20px;
}
```

### Custom Grid Columns
```css
.grid-custom {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}
```

## Best Practices

### DO:
✅ Start designs at 320px width
✅ Use horizontal scroll for overflow
✅ Follow 4px spacing increments
✅ Test at all breakpoints
✅ Use semantic HTML

### DON'T:
❌ Use `flex-wrap: wrap`
❌ Use arbitrary spacing values
❌ Assume desktop-first
❌ Hide content without consideration
❌ Break the 4px spacing scale

## Testing Checklist

- [ ] Layout works at 320px
- [ ] No unexpected horizontal scrollbar
- [ ] Touch scroll works smoothly
- [ ] Content doesn't wrap unpredictably
- [ ] Spacing follows 4px scale
- [ ] Grid columns align properly
- [ ] Text truncates or scrolls appropriately
- [ ] Navigation is accessible on mobile

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid support required
- Flexbox support required
- Smooth scrolling where supported
- Graceful degradation for older browsers

## Related Files

- `/shared/tokens.json` - Complete design token system
- `../SKILL.md` - Mobile-first layouts skill documentation
- `/design-system/monochrome-palette/` - Grayscale component styles

## Tips

1. **Test on real devices** - Emulators don't capture touch behavior
2. **Use the 24-column grid** - It's more flexible than 12 columns
3. **Trust horizontal scroll** - Better than unpredictable wrapping
4. **Stick to the spacing scale** - Consistency matters
5. **Mobile-first mindset** - Add complexity as screen size increases

## Examples in the Wild

Check `responsive-examples.html` for:
- Complete page layouts
- Responsive grid examples
- Navigation patterns
- Form layouts
- Card grids
- Horizontal scroll patterns
