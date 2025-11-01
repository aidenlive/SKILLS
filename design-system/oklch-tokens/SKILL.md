---
name: oklch-tokens
description: OKLCH color token system for perceptually uniform monochrome palettes with light/dark theme support. Use when designing color systems, implementing themes, or creating design tokens.
version: 1.0.0
---

# OKLCH Color Token System

## Purpose

Implement OKLCH color token system for perceptually uniform monochrome palettes with light/dark theme support. Modern color management for accessible, consistent interfaces.

## When to Use This Skill

- Designing color systems or palettes
- Implementing theme systems (light/dark mode)
- Creating design tokens
- Ensuring perceptually uniform color scales
- Building accessible color contrast

## What is OKLCH?

OKLCH (Lightness, Chroma, Hue) is a perceptually uniform color space that provides:

- **Predictable Lightness:** Linear relationship between values and perceived brightness
- **Consistent Chroma:** Uniform saturation across hue spectrum
- **Better Accessibility:** Easier to calculate and maintain contrast ratios
- **Human-Friendly:** Matches how humans perceive color differences

### OKLCH Syntax
```css
oklch(L C H / alpha)
```

- **L (Lightness):** 0% (black) to 100% (white)
- **C (Chroma):** 0 (gray) to 0.4+ (vivid color)
- **H (Hue):** 0-360 degrees (color wheel)
- **alpha:** 0-1 (transparency) - optional

## Monochrome Token System

### Core Tokens

```json
{
  "colors": {
    "light": {
      "bg": "oklch(98% 0 0)",
      "surface": "oklch(96% 0 0)",
      "surface-secondary": "oklch(94% 0 0)",
      "border": "oklch(88% 0 0)",
      "border-subtle": "oklch(92% 0 0)",
      "text-primary": "oklch(20% 0 0)",
      "text-secondary": "oklch(45% 0 0)",
      "text-tertiary": "oklch(60% 0 0)",
      "accent": "oklch(30% 0 0)",
      "accent-hover": "oklch(25% 0 0)"
    },
    "dark": {
      "bg": "oklch(15% 0 0)",
      "surface": "oklch(18% 0 0)",
      "surface-secondary": "oklch(22% 0 0)",
      "border": "oklch(28% 0 0)",
      "border-subtle": "oklch(24% 0 0)",
      "text-primary": "oklch(95% 0 0)",
      "text-secondary": "oklch(70% 0 0)",
      "text-tertiary": "oklch(55% 0 0)",
      "accent": "oklch(85% 0 0)",
      "accent-hover": "oklch(90% 0 0)"
    }
  }
}
```

### CSS Implementation

```css
:root {
  /* Light theme (default) */
  --color-bg: oklch(98% 0 0);
  --color-surface: oklch(96% 0 0);
  --color-surface-secondary: oklch(94% 0 0);
  --color-border: oklch(88% 0 0);
  --color-border-subtle: oklch(92% 0 0);
  --color-text-primary: oklch(20% 0 0);
  --color-text-secondary: oklch(45% 0 0);
  --color-text-tertiary: oklch(60% 0 0);
  --color-accent: oklch(30% 0 0);
  --color-accent-hover: oklch(25% 0 0);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: oklch(15% 0 0);
    --color-surface: oklch(18% 0 0);
    --color-surface-secondary: oklch(22% 0 0);
    --color-border: oklch(28% 0 0);
    --color-border-subtle: oklch(24% 0 0);
    --color-text-primary: oklch(95% 0 0);
    --color-text-secondary: oklch(70% 0 0);
    --color-text-tertiary: oklch(55% 0 0);
    --color-accent: oklch(85% 0 0);
    --color-accent-hover: oklch(90% 0 0);
  }
}

/* Manual theme toggle */
[data-theme="dark"] {
  --color-bg: oklch(15% 0 0);
  --color-surface: oklch(18% 0 0);
  /* ... all dark tokens ... */
}
```

## Semantic Token Naming

### Naming Convention
```
--color-{context}-{variant}-{state}
```

Examples:
```css
--color-bg                  /* Background */
--color-surface             /* Card/panel background */
--color-text-primary        /* Main text */
--color-text-secondary      /* Supporting text */
--color-border              /* Standard border */
--color-accent              /* Interactive elements */
--color-accent-hover        /* Hover state */
--color-success             /* Success feedback */
--color-error               /* Error feedback */
--color-warning             /* Warning feedback */
```

## Adding Purposeful Color

### Signal Colors (Sparingly)
```css
:root {
  /* Success (green) */
  --color-success: oklch(60% 0.15 145);
  --color-success-bg: oklch(95% 0.05 145);
  --color-success-border: oklch(80% 0.10 145);

  /* Error (red) */
  --color-error: oklch(55% 0.20 25);
  --color-error-bg: oklch(95% 0.05 25);
  --color-error-border: oklch(80% 0.10 25);

  /* Warning (yellow) */
  --color-warning: oklch(65% 0.15 85);
  --color-warning-bg: oklch(95% 0.05 85);
  --color-warning-border: oklch(85% 0.10 85);

  /* Info (blue) */
  --color-info: oklch(60% 0.15 250);
  --color-info-bg: oklch(95% 0.05 250);
  --color-info-border: oklch(80% 0.10 250);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-success: oklch(70% 0.15 145);
    --color-success-bg: oklch(20% 0.05 145);
    --color-success-border: oklch(35% 0.10 145);

    --color-error: oklch(70% 0.20 25);
    --color-error-bg: oklch(20% 0.05 25);
    --color-error-border: oklch(35% 0.10 25);

    --color-warning: oklch(75% 0.15 85);
    --color-warning-bg: oklch(25% 0.05 85);
    --color-warning-border: oklch(40% 0.10 85);

    --color-info: oklch(70% 0.15 250);
    --color-info-bg: oklch(20% 0.05 250);
    --color-info-border: oklch(35% 0.10 250);
  }
}
```

## Usage Patterns

### Backgrounds
```css
body {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.card-nested {
  background: var(--color-surface-secondary);
}
```

### Typography
```css
h1, h2, h3 {
  color: var(--color-text-primary);
}

p {
  color: var(--color-text-secondary);
}

.caption {
  color: var(--color-text-tertiary);
}
```

### Interactive Elements
```css
button {
  background: var(--color-accent);
  color: var(--color-bg);
  border: none;
}

button:hover {
  background: var(--color-accent-hover);
}

button:disabled {
  background: var(--color-border);
  color: var(--color-text-tertiary);
}
```

### Borders
```css
.divider {
  border-top: 1px solid var(--color-border);
}

.subtle-divider {
  border-top: 1px solid var(--color-border-subtle);
}

input:focus {
  outline: 2px solid var(--color-accent);
}
```

## Theme Switching

### JavaScript Implementation
```javascript
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function getPreferredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// Initialize theme
setTheme(getPreferredTheme());

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});
```

### React Hook
```typescript
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored as 'light' | 'dark';

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
}
```

## Accessibility Considerations

### Contrast Ratios

OKLCH makes it easier to maintain WCAG contrast ratios:

```
Light theme:
- Text primary (20%) on bg (98%) = ~16:1 (AAA)
- Text secondary (45%) on bg (98%) = ~7:1 (AA)

Dark theme:
- Text primary (95%) on bg (15%) = ~16:1 (AAA)
- Text secondary (70%) on bg (15%) = ~7:1 (AA)
```

### Testing Contrast
```javascript
// Simplified contrast calculation for OKLCH
function getContrast(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Example
const bgLightness = 0.98;
const textLightness = 0.20;
const contrast = getContrast(bgLightness, textLightness);
console.log(`Contrast ratio: ${contrast.toFixed(2)}:1`);
```

## Color Scale Generation

### Generate Lightness Scale
```javascript
function generateLightnessScale(steps = 10) {
  const scale = [];
  for (let i = 0; i < steps; i++) {
    const lightness = (100 / (steps - 1)) * i;
    scale.push(`oklch(${lightness}% 0 0)`);
  }
  return scale;
}

// Result: ["oklch(0% 0 0)", "oklch(11% 0 0)", ..., "oklch(100% 0 0)"]
```

## Browser Support

OKLCH is supported in:
- Chrome/Edge 111+
- Safari 15.4+
- Firefox 113+

### Fallback Strategy
```css
.element {
  /* Fallback */
  background: #f5f5f5;
  /* OKLCH with fallback */
  background: oklch(96% 0 0);
}
```

Or use `@supports`:
```css
@supports (background: oklch(0% 0 0)) {
  :root {
    --color-bg: oklch(98% 0 0);
  }
}
```

## Design Philosophy

**Monochrome first, color as signal.**

- Default to grayscale (Chroma = 0)
- Add color purposefully for feedback and hierarchy
- Maintain perceptual uniformity
- Ensure accessibility through proper lightness values
- Support both light and dark themes

## Common Pitfalls

- **Too Much Chroma:** Keep monochrome at C=0; use color sparingly
- **Insufficient Contrast:** Verify WCAG ratios for text
- **Theme Inconsistency:** Ensure both themes feel balanced
- **Hardcoded Values:** Always use CSS variables, never hardcode

## Additional Resources

See `resources/` directory for:
- Complete token examples
- Theme switching implementations
- Contrast ratio calculator
- Color scale generators
- Migration guide from hex/rgb
