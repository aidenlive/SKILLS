# Monochrome Palette Resources

This directory contains production-ready CSS components and utilities for building monochrome (grayscale-first) interfaces with purposeful minimalism and clear hierarchy.

## Files

### `monochrome-components.css`
Complete component library with buttons, cards, forms, badges, alerts, and more—all built with grayscale-first design principles.

**Includes:**
- Buttons (primary, secondary, ghost variants)
- Cards (default, elevated, interactive)
- Form inputs (text, textarea, with validation states)
- Badges and tags
- Alerts and messages
- Dividers
- Lists
- Tooltips
- Loading states (skeleton, spinner)
- Shadows and utilities

**Usage:**
```html
<link rel="stylesheet" href="resources/monochrome-components.css">

<!-- Primary Button -->
<button class="btn btn-primary">Save Changes</button>

<!-- Card Component -->
<div class="card">
  <h3 class="card-title">Card Title</h3>
  <p class="card-description">Card description text goes here.</p>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">Action</button>
  </div>
</div>

<!-- Form Input -->
<label class="label">Email Address</label>
<input type="email" class="input" placeholder="Enter your email">
```

### `grayscale-utilities.css`
Utility-first CSS classes for rapid development with consistent spacing, colors, and typography.

**Includes:**
- Text colors (primary, secondary, tertiary)
- Background colors
- Border utilities
- Spacing (padding, margin, gap)
- Layout (flexbox, grid)
- Typography utilities
- Interactive states
- Responsive variants

**Usage:**
```html
<link rel="stylesheet" href="resources/grayscale-utilities.css">

<!-- Text and Background -->
<div class="bg-surface p-6 rounded-lg">
  <h2 class="text-primary font-semibold mb-2">Heading</h2>
  <p class="text-secondary">Description text here.</p>
</div>

<!-- Flexbox Layout -->
<div class="flex items-center justify-between gap-4">
  <span class="text-tertiary">Label</span>
  <button class="btn btn-primary">Action</button>
</div>

<!-- Responsive Text -->
<h1 class="text-lg sm:text-xl md:text-2xl font-bold">
  Responsive Heading
</h1>
```

### `component-examples.html`
Interactive demo page showcasing all components in action. Open in a browser to see live examples with hover states, animations, and theme switching.

**Features:**
- Live component demonstrations
- Interactive examples
- Theme toggle (light/dark)
- Copy-paste ready code snippets
- Responsive layout examples

## Quick Start

### 1. Basic Setup

Include both stylesheets in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Monochrome App</title>
  <link rel="stylesheet" href="resources/monochrome-components.css">
  <link rel="stylesheet" href="resources/grayscale-utilities.css">
</head>
<body class="bg-page">
  <!-- Your content here -->
</body>
</html>
```

### 2. Build a Simple Page

```html
<div class="container max-w-xl mx-auto p-6">
  <header class="mb-8">
    <h1 class="text-3xl font-bold mb-2">Welcome</h1>
    <p class="text-secondary">A minimal, elegant interface.</p>
  </header>

  <section class="card mb-6">
    <h2 class="card-title">Get Started</h2>
    <p class="card-description">
      Start building with our monochrome component library.
    </p>
    <div class="card-footer">
      <button class="btn btn-primary">Learn More</button>
      <button class="btn btn-secondary">View Docs</button>
    </div>
  </section>

  <section class="card">
    <form class="flex flex-col gap-4">
      <div>
        <label class="label">Name</label>
        <input type="text" class="input" placeholder="Enter your name">
      </div>
      <div>
        <label class="label">Email</label>
        <input type="email" class="input" placeholder="your@email.com">
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </section>
</div>
```

### 3. View Interactive Examples

Open `component-examples.html` in your browser to see all components in action with:
- Live hover states
- Interactive demonstrations
- Theme switching
- Responsive behavior

## Design Principles

### 1. Grayscale Foundation
95% of the interface uses grayscale values. Color is reserved for:
- Status indicators (success, error, warning)
- Feedback states (hover, focus, active)
- Rare emphasis or brand elements

### 2. Hierarchy Through Contrast
Create visual hierarchy using:
- Lightness differences (text: gray-80 → gray-55 → gray-40)
- Size and weight (bold headings, regular body text)
- Spacing and elevation (cards, shadows)

### 3. Purposeful Minimalism
- Every element serves a function
- Generous white space for clarity
- Subtle borders and dividers
- Restraint creates elegance

## Component Patterns

### Button Group
```html
<div class="flex gap-3">
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-secondary">Cancel</button>
  <button class="btn btn-ghost">Reset</button>
</div>
```

### Alert with Action
```html
<div class="alert alert-success">
  <div class="flex justify-between items-center w-full">
    <div>
      <h4 class="alert-title">Success!</h4>
      <p class="alert-message">Your changes have been saved.</p>
    </div>
    <button class="btn btn-sm btn-ghost">Undo</button>
  </div>
</div>
```

### Form with Validation
```html
<div>
  <label class="label">Password</label>
  <input type="password" class="input error" value="123">
  <p class="helper-text error-text">
    Password must be at least 8 characters.
  </p>
</div>
```

### Card Grid
```html
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  <div class="card">
    <h3 class="card-title">Feature One</h3>
    <p class="card-description">Description here.</p>
  </div>
  <div class="card">
    <h3 class="card-title">Feature Two</h3>
    <p class="card-description">Description here.</p>
  </div>
  <div class="card">
    <h3 class="card-title">Feature Three</h3>
    <p class="card-description">Description here.</p>
  </div>
</div>
```

### Loading State
```html
<!-- Skeleton loader -->
<div class="card">
  <div class="skeleton skeleton-title"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
</div>

<!-- Button with spinner -->
<button class="btn btn-primary" disabled>
  <span class="spinner"></span>
  Loading...
</button>
```

## Customization

### Adjusting Grayscale Values

Edit the CSS custom properties in `monochrome-components.css`:

```css
:root {
  /* Adjust lightness values to your preference */
  --gray-80: oklch(20% 0 0);  /* Primary text - make darker or lighter */
  --gray-55: oklch(45% 0 0);  /* Secondary text */
  --gray-40: oklch(60% 0 0);  /* Tertiary text */

  /* Adjust surface colors */
  --gray-2: oklch(98% 0 0);   /* Page background */
  --gray-4: oklch(96% 0 0);   /* Card surface */
}
```

### Adding Custom Components

Follow the existing patterns:

```css
.my-component {
  background: var(--gray-4);
  border: 1px solid var(--gray-12);
  padding: var(--space-6);
  border-radius: 8px;
  transition: all 0.15s ease;
}

.my-component:hover {
  border-color: var(--gray-16);
  box-shadow: 0 4px 8px oklch(0% 0 0 / 0.08);
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- OKLCH color space (with fallbacks)
- CSS Custom Properties (variables)

## Accessibility

All components follow accessibility best practices:
- ✅ WCAG AA contrast ratios (4.5:1 for normal text)
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ Screen reader friendly markup
- ✅ Semantic HTML elements

## Related Files

- `/shared/tokens.json` - Complete design token system
- `../SKILL.md` - Monochrome palette skill documentation
- `/design-system/oklch-tokens/` - OKLCH color system resources

## Tips

1. **Start with components**, add utilities as needed
2. **Use semantic HTML** (button, form, section) for better accessibility
3. **Test with theme toggle** to ensure dark mode compatibility
4. **Maintain the 95% grayscale rule**—only add color for signals
5. **Trust the spacing scale**—stick to 4px increments (--space-1 through --space-8)

## Examples in the Wild

Check `component-examples.html` for:
- Complete page layouts
- Form designs
- Card grids
- Navigation patterns
- Dashboard-style interfaces
