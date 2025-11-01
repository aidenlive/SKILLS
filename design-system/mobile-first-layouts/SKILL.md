---
name: mobile-first-layouts
description: Mobile-first layouts (320-1440px) with 24-column grid, 4px spacing scale, no flex-wrap. Use when designing responsive layouts, creating page templates, or implementing mobile-first strategies.
version: 1.0.0
---

# Mobile-First Layout System

## Purpose

Implement mobile-first layouts with 24-column grid, 4px spacing scale, and strict no flex-wrap rule. Responsive, predictable layouts that work across all devices.

## When to Use This Skill

- Designing responsive layouts
- Creating page templates
- Implementing mobile-first design strategies
- Building grid-based systems
- Handling overflow and scrolling patterns

## Core Principles

1. **Mobile First:** Design for 320px, scale up
2. **No Flex-Wrap:** Use horizontal scroll or truncation instead
3. **24-Column Grid:** Flexible subdivision (2, 3, 4, 6, 8, 12, 24 columns)
4. **4px Base Unit:** All spacing increments of 4px
5. **Predictable Breakpoints:** Standard viewport ranges

## Breakpoint Strategy

### Standard Breakpoints
```css
/* Mobile: 320px - 639px (default, no media query) */
/* Tablet: 640px - 1023px */
@media (min-width: 640px) { }

/* Desktop: 1024px - 1439px */
@media (min-width: 1024px) { }

/* Wide: 1440px+ */
@media (min-width: 1440px) { }
```

### Viewport Ranges
```
Mobile (small):  320px - 479px
Mobile (large):  480px - 639px
Tablet:          640px - 1023px
Desktop:         1024px - 1439px
Wide:            1440px+
```

### Implementation
```css
:root {
  --viewport-mobile-sm: 320px;
  --viewport-mobile-lg: 480px;
  --viewport-tablet: 640px;
  --viewport-desktop: 1024px;
  --viewport-wide: 1440px;
}
```

## 24-Column Grid System

### Why 24 Columns?

Divisible by: 2, 3, 4, 6, 8, 12, 24

**Flexible layouts:**
- 2 columns: 12 + 12
- 3 columns: 8 + 8 + 8
- 4 columns: 6 + 6 + 6 + 6
- 6 columns: 4 + 4 + 4 + 4 + 4 + 4
- Asymmetric: 16 + 8, 18 + 6, etc.

### Grid Implementation
```css
.grid {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: var(--space-4);
}

/* Responsive columns */
.col-24 { grid-column: span 24; } /* Full width */
.col-12 { grid-column: span 12; } /* Half */
.col-8  { grid-column: span 8; }  /* Third */
.col-6  { grid-column: span 6; }  /* Quarter */
.col-4  { grid-column: span 4; }  /* Sixth */

/* Responsive */
@media (min-width: 640px) {
  .col-sm-12 { grid-column: span 12; }
  .col-sm-8  { grid-column: span 8; }
  .col-sm-6  { grid-column: span 6; }
}

@media (min-width: 1024px) {
  .col-md-12 { grid-column: span 12; }
  .col-md-8  { grid-column: span 8; }
  .col-md-6  { grid-column: span 6; }
}
```

### Grid Usage
```html
<div class="grid">
  <div class="col-24 col-sm-12 col-md-8">Content</div>
  <div class="col-24 col-sm-12 col-md-8">Content</div>
  <div class="col-24 col-sm-24 col-md-8">Content</div>
</div>
```

## Spacing Scale (4px Base)

### Scale Definition
```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --space-32: 128px;
}
```

### Spacing Usage
```css
/* Component spacing */
.card {
  padding: var(--space-6);
  gap: var(--space-4);
}

/* Section spacing */
section {
  margin-bottom: var(--space-16);
}

/* Element spacing */
.stack > * + * {
  margin-top: var(--space-4);
}
```

### Responsive Spacing
```css
.container {
  padding: var(--space-4);
}

@media (min-width: 640px) {
  .container {
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}
```

## No Flex-Wrap Rule

### The Problem
```css
/* ❌ DON'T: Unpredictable wrapping */
.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
/* Items wrap at arbitrary breakpoints, causing layout shifts */
```

### The Solution

**Option 1: Horizontal Scroll**
```css
/* ✅ DO: Predictable scroll */
.nav {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

/* Hide scrollbar on desktop if desired */
@media (min-width: 1024px) {
  .nav {
    scrollbar-width: none;
  }
  .nav::-webkit-scrollbar {
    display: none;
  }
}
```

**Option 2: Truncation**
```css
/* ✅ DO: Truncate text */
.nav-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
```

**Option 3: Responsive Display**
```css
/* ✅ DO: Hide/show at breakpoints */
.nav-item.optional {
  display: none;
}

@media (min-width: 640px) {
  .nav-item.optional {
    display: flex;
  }
}
```

## Layout Patterns

### Container
```css
.container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-4);
}

@media (min-width: 640px) {
  .container {
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}
```

### Stack (Vertical Spacing)
```css
.stack {
  display: flex;
  flex-direction: column;
}

.stack > * + * {
  margin-top: var(--space-4);
}

/* Responsive spacing */
@media (min-width: 1024px) {
  .stack > * + * {
    margin-top: var(--space-6);
  }
}
```

### Cluster (Horizontal Grouping)
```css
.cluster {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.cluster > * {
  flex-shrink: 0; /* Prevent shrinking */
}
```

### Sidebar Layout
```css
.sidebar-layout {
  display: grid;
  gap: var(--space-6);
}

/* Mobile: Stack */
.sidebar-layout {
  grid-template-columns: 1fr;
}

/* Desktop: Sidebar + Main */
@media (min-width: 1024px) {
  .sidebar-layout {
    grid-template-columns: 6fr 18fr; /* 1/4 + 3/4 of 24 columns */
  }
}
```

### Card Grid
```css
.card-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* Ensure minimum width on mobile */
@media (max-width: 639px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

## Overflow Handling

### Horizontal Scroll
```css
.scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--gray-40) transparent;
}

/* Custom scrollbar (webkit) */
.scroll-container::-webkit-scrollbar {
  height: 8px;
}

.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: var(--gray-40);
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--gray-55);
}
```

### Scroll Indicators
```css
/* Shadow to indicate scrollable content */
.scroll-container {
  background:
    /* Shadows */
    linear-gradient(90deg, var(--gray-4) 30%, transparent) left,
    linear-gradient(90deg, transparent, var(--gray-4) 70%) right;
  background-repeat: no-repeat;
  background-size: 40px 100%, 40px 100%;
  background-attachment: local, local;
}
```

## Text Truncation

### Single Line
```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Multi-Line
```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

## Mobile-First Examples

### Navigation
```css
/* Mobile: Horizontal scroll */
.nav {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-4);
}

.nav-item {
  flex-shrink: 0;
  padding: var(--space-2) var(--space-4);
  white-space: nowrap;
}

/* Desktop: Spread across */
@media (min-width: 1024px) {
  .nav {
    overflow-x: visible;
    justify-content: space-between;
  }
}
```

### Data Table
```css
/* Mobile: Horizontal scroll */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  min-width: 600px; /* Force scroll on mobile */
  width: 100%;
}

/* Desktop: Full width */
@media (min-width: 1024px) {
  table {
    min-width: 0;
  }
}
```

### Form Layout
```css
/* Mobile: Stack */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Desktop: Two columns */
@media (min-width: 640px) {
  .form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .form .full-width {
    grid-column: span 2;
  }
}
```

## Best Practices

### DO:
- Start designs at 320px width
- Use horizontal scroll for overflow
- Follow 4px spacing increments
- Use 24-column grid for layouts
- Test at all breakpoints

### DON'T:
- Use `flex-wrap: wrap`
- Use arbitrary spacing values
- Assume desktop-first
- Hide content without consideration
- Create breakpoint-specific layouts for every size

## Testing Checklist

- [ ] Layout works at 320px
- [ ] No horizontal scrollbar on page (unless intended)
- [ ] Touchscreen scroll works smoothly
- [ ] No content wrapping unexpectedly
- [ ] Spacing follows 4px scale
- [ ] Grid columns align properly
- [ ] Text truncates or scrolls appropriately

## Philosophy

**Design for constraints, scale with intention.**

Mobile-first forces better decisions. Horizontal scroll is better than wrap. Spacing should be systematic, not arbitrary.

## Additional Resources

See `resources/` directory for:
- Complete layout templates
- Responsive patterns
- Grid examples
- Overflow handling strategies
