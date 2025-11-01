---
name: monochrome-palette
description: Monochrome aesthetic with grayscale values, spatial hierarchy, and purposeful minimalism. Use when designing interfaces, establishing visual identity, or creating minimal, elegant designs.
version: 1.0.0
---

# Monochrome Palette Design

## Purpose

Implement monochrome aesthetic with grayscale values, spatial hierarchy, and purposeful minimalism. Elegant, focused interfaces that prioritize content and hierarchy.

## When to Use This Skill

- Designing minimal interfaces
- Establishing visual identity through hierarchy
- Creating elegant, focused designs
- Reducing visual noise
- Emphasizing content over decoration

## Design Philosophy

**Restraint creates clarity. Hierarchy through space, not color.**

### Core Principles

1. **Monochrome First:** Default to grayscale for 95% of interface
2. **Color as Signal:** Use color sparingly for feedback and emphasis
3. **Spatial Hierarchy:** White space and scale create structure
4. **Purposeful Minimalism:** Every element serves a function
5. **Timeless Aesthetic:** Avoid trends; embrace fundamentals

## Grayscale Foundation

### Light Theme Palette
```css
:root {
  /* Backgrounds */
  --gray-0: oklch(100% 0 0);   /* Pure white */
  --gray-2: oklch(98% 0 0);    /* Page background */
  --gray-4: oklch(96% 0 0);    /* Surface (cards) */
  --gray-6: oklch(94% 0 0);    /* Nested surface */

  /* Borders & Dividers */
  --gray-12: oklch(92% 0 0);   /* Subtle border */
  --gray-16: oklch(88% 0 0);   /* Standard border */
  --gray-24: oklch(80% 0 0);   /* Strong border */

  /* Text */
  --gray-40: oklch(60% 0 0);   /* Tertiary text */
  --gray-55: oklch(45% 0 0);   /* Secondary text */
  --gray-80: oklch(20% 0 0);   /* Primary text */
  --gray-100: oklch(0% 0 0);   /* Pure black */
}
```

### Dark Theme Palette
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Backgrounds */
    --gray-100: oklch(0% 0 0);
    --gray-85: oklch(15% 0 0);   /* Page background */
    --gray-82: oklch(18% 0 0);   /* Surface (cards) */
    --gray-78: oklch(22% 0 0);   /* Nested surface */

    /* Borders & Dividers */
    --gray-76: oklch(24% 0 0);   /* Subtle border */
    --gray-72: oklch(28% 0 0);   /* Standard border */
    --gray-60: oklch(40% 0 0);   /* Strong border */

    /* Text */
    --gray-45: oklch(55% 0 0);   /* Tertiary text */
    --gray-30: oklch(70% 0 0);   /* Secondary text */
    --gray-5: oklch(95% 0 0);    /* Primary text */
    --gray-0: oklch(100% 0 0);   /* Pure white */
  }
}
```

## Hierarchy Through Contrast

### Text Hierarchy
```css
/* Primary: Headings, important content */
h1, h2, h3, .primary-text {
  color: var(--gray-80); /* Light theme */
  color: var(--gray-5);  /* Dark theme */
}

/* Secondary: Body text, descriptions */
p, .secondary-text {
  color: var(--gray-55);
  color: var(--gray-30);
}

/* Tertiary: Labels, captions, metadata */
.caption, .metadata {
  color: var(--gray-40);
  color: var(--gray-45);
}
```

### Surface Hierarchy
```css
/* Page background (lowest) */
body {
  background: var(--gray-2);
}

/* Elevated surface (cards, panels) */
.card {
  background: var(--gray-4);
}

/* Nested elevation */
.card .nested {
  background: var(--gray-6);
}

/* Interactive elements (highest) */
button {
  background: var(--gray-80);
  color: var(--gray-0);
}
```

## Creating Depth Without Color

### Layering Strategy
```css
/* Base layer */
.container {
  background: var(--gray-2);
  padding: var(--space-8);
}

/* Elevated layer +1 */
.card {
  background: var(--gray-4);
  border: 1px solid var(--gray-16);
  padding: var(--space-6);
}

/* Elevated layer +2 */
.modal {
  background: var(--gray-0);
  border: 1px solid var(--gray-16);
  box-shadow: 0 8px 24px oklch(0% 0 0 / 0.12);
}
```

### Shadow Hierarchy
```css
/* Subtle elevation */
.shadow-sm {
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.06);
}

/* Standard elevation */
.shadow-md {
  box-shadow: 0 4px 8px oklch(0% 0 0 / 0.08);
}

/* High elevation */
.shadow-lg {
  box-shadow: 0 8px 24px oklch(0% 0 0 / 0.12);
}

/* Maximum elevation */
.shadow-xl {
  box-shadow: 0 16px 48px oklch(0% 0 0 / 0.16);
}
```

## Strategic Use of Color

### When to Add Color

**DO use color for:**
- Status indicators (success, error, warning)
- Interactive feedback (hover, focus, active)
- Data visualization (charts, graphs)
- Brand identity (logo, primary actions)

**DON'T use color for:**
- General text and headings
- Decorative elements
- Navigation structure
- Content hierarchy

### Signal Colors (Minimal Chroma)
```css
:root {
  /* Success: Minimal green */
  --signal-success: oklch(60% 0.12 145);
  --signal-success-bg: oklch(95% 0.03 145);

  /* Error: Minimal red */
  --signal-error: oklch(55% 0.15 25);
  --signal-error-bg: oklch(95% 0.03 25);

  /* Warning: Minimal yellow */
  --signal-warning: oklch(65% 0.12 85);
  --signal-warning-bg: oklch(95% 0.03 85);

  /* Info: Minimal blue */
  --signal-info: oklch(60% 0.12 250);
  --signal-info-bg: oklch(95% 0.03 250);
}
```

### Accent Color Usage
```css
/* Primary action */
button.primary {
  background: var(--gray-80);
  color: var(--gray-0);
}

button.primary:hover {
  background: var(--gray-100);
}

/* Links */
a {
  color: var(--gray-80);
  text-decoration: underline;
  text-decoration-color: var(--gray-40);
  text-underline-offset: 2px;
}

a:hover {
  text-decoration-color: var(--gray-80);
}
```

## Typography as Hierarchy

### Scale and Weight
```css
/* Large, bold for emphasis */
h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--gray-80);
}

/* Medium for structure */
h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--gray-80);
}

/* Base for content */
p {
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.6;
  color: var(--gray-55);
}

/* Small for metadata */
.caption {
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--gray-40);
}
```

## Spatial Hierarchy

### Generous White Space
```css
/* Section spacing */
section {
  margin-bottom: var(--space-16); /* 64px */
}

/* Content spacing */
.content > * + * {
  margin-top: var(--space-4); /* 16px */
}

/* Component spacing */
.card {
  padding: var(--space-6); /* 24px */
  gap: var(--space-4); /* 16px */
}
```

### Visual Breathing Room
```
Dense layout = cognitive load
Spacious layout = clarity

Prefer:
- Larger padding over borders
- White space over dividers
- Vertical rhythm over horizontal density
```

## Border Strategy

### Subtle Borders
```css
/* Default: Barely visible */
.card {
  border: 1px solid var(--gray-12);
}

/* Interactive: More visible */
.card:hover {
  border-color: var(--gray-16);
}

/* Focus: Clear indication */
.card:focus-within {
  border-color: var(--gray-24);
}
```

### Dividers
```css
/* Subtle section divider */
.divider {
  height: 1px;
  background: var(--gray-12);
  margin: var(--space-8) 0;
}

/* Stronger divider */
.divider-strong {
  height: 1px;
  background: var(--gray-16);
  margin: var(--space-12) 0;
}
```

## Interactive States

### Hover States
```css
/* Subtle background change */
.item:hover {
  background: var(--gray-6);
}

/* Darken text */
a:hover {
  color: var(--gray-100);
}

/* Elevate surface */
.card:hover {
  box-shadow: 0 4px 8px oklch(0% 0 0 / 0.08);
}
```

### Active/Selected States
```css
/* Selected item */
.item[aria-selected="true"] {
  background: var(--gray-80);
  color: var(--gray-0);
}

/* Active button */
button:active {
  background: var(--gray-100);
  transform: translateY(1px);
}
```

## Component Examples

### Monochrome Button
```css
.btn {
  padding: var(--space-3) var(--space-6);
  background: var(--gray-80);
  color: var(--gray-0);
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.15s ease;
}

.btn:hover {
  background: var(--gray-100);
}

.btn-secondary {
  background: var(--gray-4);
  color: var(--gray-80);
  border: 1px solid var(--gray-16);
}

.btn-secondary:hover {
  background: var(--gray-6);
  border-color: var(--gray-24);
}
```

### Monochrome Card
```css
.card {
  background: var(--gray-4);
  border: 1px solid var(--gray-12);
  border-radius: 8px;
  padding: var(--space-6);
  transition: border-color 0.15s ease;
}

.card:hover {
  border-color: var(--gray-16);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-80);
  margin-bottom: var(--space-2);
}

.card-description {
  font-size: var(--text-sm);
  color: var(--gray-55);
  line-height: 1.5;
}
```

## Anti-Patterns

**Avoid:**
- Colorful backgrounds for decoration
- Multiple accent colors competing for attention
- Bright colors for primary text
- Excessive use of borders (prefer spacing)
- Gradient backgrounds (unless purposeful)
- Heavy shadows on every element

**Prefer:**
- Grayscale as foundation
- Single accent color if needed
- Hierarchy through size and weight
- White space as separator
- Subtle shadows for elevation only
- Purposeful color for signal/feedback

## Validation Checklist

- [ ] 95% of interface uses grayscale
- [ ] Color is reserved for signals/feedback
- [ ] Text hierarchy clear through size/weight
- [ ] Adequate white space between elements
- [ ] Borders are subtle and purposeful
- [ ] Interactive states are evident
- [ ] Contrast ratios meet WCAG standards
- [ ] Design feels calm and focused

## Philosophy

**Monochrome is not limitation—it's liberation.**

Reduce visual noise. Increase clarity. Let content shine. Create timeless interfaces through restraint and hierarchy.

## Additional Resources

See `resources/` directory for:
- Complete component examples
- Color usage guidelines
- Hierarchy patterns
- Anti-pattern examples
