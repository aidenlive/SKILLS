---
name: accessibility-check
description: WCAG compliance checklist covering ARIA, keyboard navigation, focus management, and semantic HTML. Use when auditing accessibility, implementing inclusive design, or validating WCAG compliance.
version: 1.0.0
---

# Accessibility Compliance Guide

## Purpose

Implement WCAG 2.1 Level AA compliance with comprehensive checks for ARIA, keyboard navigation, focus management, and semantic HTML. Inclusive, accessible web experiences for all users.

## When to Use This Skill

- Auditing accessibility compliance
- Implementing inclusive design patterns
- Validating WCAG conformance
- Testing keyboard navigation
- Reviewing screen reader compatibility

## WCAG 2.1 Level AA Standards

### Four Principles (POUR)

1. **Perceivable:** Information must be presentable to users
2. **Operable:** Interface must be usable by all
3. **Understandable:** Content must be readable and predictable
4. **Robust:** Content must work with current and future technologies

## Semantic HTML

### Use Proper Elements
```html
<!-- ✅ Semantic -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <article>
    <h1>Article Title</h1>
    <p>Content</p>
  </article>
</main>
<footer>
  <p>&copy; 2025</p>
</footer>

<!-- ❌ Non-semantic -->
<div class="header">
  <div class="nav">
    <span onclick="navigate()">Home</span>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="title">Article Title</div>
    <div>Content</div>
  </div>
</div>
```

### Heading Hierarchy
```html
<!-- ✅ Correct hierarchy -->
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>

<!-- ❌ Skip levels -->
<h1>Page Title</h1>
  <h3>Section</h3> <!-- Skipped h2 -->
```

### Landmark Roles
```html
<header>         <!-- role="banner" implicit -->
<nav>            <!-- role="navigation" implicit -->
<main>           <!-- role="main" implicit -->
<aside>          <!-- role="complementary" implicit -->
<footer>         <!-- role="contentinfo" implicit -->
<section>        <!-- role="region" with aria-label -->
<article>        <!-- role="article" implicit -->
```

## ARIA Patterns

### When to Use ARIA

**First Rule of ARIA:** Don't use ARIA if native HTML works.

```html
<!-- ✅ Native HTML preferred -->
<button>Click me</button>

<!-- ❌ Unnecessary ARIA -->
<div role="button" tabindex="0" onclick="...">Click me</div>
```

### Common ARIA Attributes

**Labels:**
```html
<!-- aria-label: Invisible label -->
<button aria-label="Close dialog">
  <svg>...</svg>
</button>

<!-- aria-labelledby: Reference visible label -->
<h2 id="dialog-title">Confirm Action</h2>
<div role="dialog" aria-labelledby="dialog-title">
  ...
</div>

<!-- aria-describedby: Additional description -->
<input
  type="email"
  id="email"
  aria-describedby="email-help"
>
<span id="email-help">We'll never share your email</span>
```

**States:**
```html
<!-- aria-expanded: Disclosure state -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>...</ul>

<!-- aria-selected: Selection state -->
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
  <button role="tab" aria-selected="false">Tab 2</button>
</div>

<!-- aria-pressed: Toggle state -->
<button aria-pressed="false">
  Notifications
</button>

<!-- aria-checked: Checkbox/radio state -->
<div role="checkbox" aria-checked="true">
  Subscribe
</div>
```

**Live Regions:**
```html
<!-- aria-live: Dynamic content -->
<div aria-live="polite" aria-atomic="true">
  Status message appears here
</div>

<!-- Levels: off, polite, assertive -->
<div aria-live="assertive">
  Error: Form submission failed
</div>

<!-- role="status" (aria-live="polite" implicit) -->
<div role="status">
  3 items in cart
</div>

<!-- role="alert" (aria-live="assertive" implicit) -->
<div role="alert">
  Password must be at least 8 characters
</div>
```

## Form Accessibility

### Labels
```html
<!-- ✅ Explicit label -->
<label for="username">Username</label>
<input type="text" id="username">

<!-- ✅ Implicit label -->
<label>
  Username
  <input type="text">
</label>

<!-- ❌ No label -->
<input type="text" placeholder="Username">
```

### Required Fields
```html
<label for="email">
  Email <span aria-label="required">*</span>
</label>
<input
  type="email"
  id="email"
  required
  aria-required="true"
>
```

### Error Messages
```html
<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-describedby="password-error"
  aria-invalid="true"
>
<span id="password-error" role="alert">
  Password must be at least 8 characters
</span>
```

### Fieldsets
```html
<fieldset>
  <legend>Shipping method</legend>
  <label>
    <input type="radio" name="shipping" value="standard">
    Standard
  </label>
  <label>
    <input type="radio" name="shipping" value="express">
    Express
  </label>
</fieldset>
```

## Keyboard Navigation

### Focus Management
```css
/* ✅ Visible focus indicator */
:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ✅ Enhanced focus for keyboard users */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Only remove for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* ❌ Never do this */
:focus {
  outline: none;
}
```

### Tab Order
```html
<!-- Natural tab order (preferred) -->
<button>First</button>
<button>Second</button>
<button>Third</button>

<!-- Only use tabindex when necessary -->
<div tabindex="0">Focusable div</div>
<button tabindex="-1">Programmatically focusable</button>

<!-- ❌ Don't override natural order -->
<button tabindex="3">Third</button>
<button tabindex="1">First</button>
<button tabindex="2">Second</button>
```

### Keyboard Interactions

**Button:**
- Enter/Space: Activate

**Link:**
- Enter: Follow link

**Checkbox:**
- Space: Toggle

**Radio:**
- Arrow keys: Navigate
- Space: Select

**Dropdown:**
- Enter/Space: Open
- Arrow keys: Navigate
- Escape: Close
- Tab: Close and move to next element

### Skip Links
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background: var(--color-bg);
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

## Focus Trapping (Modals)

```javascript
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Focus first element
  firstFocusable.focus();
}
```

## Color Contrast

### WCAG Requirements

**Level AA:**
- Normal text (< 18pt): 4.5:1
- Large text (≥ 18pt or ≥ 14pt bold): 3:1
- UI components and graphics: 3:1

**Level AAA:**
- Normal text: 7:1
- Large text: 4.5:1

### Testing Contrast
```javascript
// Simplified contrast calculation
function getContrast(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Example with OKLCH
const bgLightness = 0.98;
const textLightness = 0.20;
const ratio = getContrast(bgLightness, textLightness);

console.log(`Contrast ratio: ${ratio.toFixed(2)}:1`);
// Should be ≥ 4.5 for normal text
```

### Good Contrast Examples
```css
/* ✅ High contrast */
.text-on-light {
  background: oklch(98% 0 0);
  color: oklch(20% 0 0); /* ~16:1 ratio */
}

.text-on-dark {
  background: oklch(15% 0 0);
  color: oklch(95% 0 0); /* ~16:1 ratio */
}

/* ❌ Poor contrast */
.bad-contrast {
  background: oklch(90% 0 0);
  color: oklch(70% 0 0); /* ~2.5:1 ratio - fails WCAG */
}
```

## Images and Media

### Alternative Text
```html
<!-- ✅ Descriptive alt text -->
<img src="chart.png" alt="Bar chart showing 20% increase in sales">

<!-- ✅ Decorative image -->
<img src="decoration.png" alt="">

<!-- ✅ Logo with link -->
<a href="/">
  <img src="logo.png" alt="Company name - Home">
</a>

<!-- ❌ Missing alt -->
<img src="photo.png">

<!-- ❌ Redundant alt -->
<img src="dog.jpg" alt="Image of a dog">
```

### Video and Audio
```html
<!-- Captions/subtitles required -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
</video>

<!-- Transcript for audio -->
<audio controls src="podcast.mp3"></audio>
<a href="transcript.html">Transcript</a>
```

## Screen Reader Testing

### Announcement Patterns
```html
<!-- Status message (polite) -->
<div role="status" aria-live="polite">
  Item added to cart
</div>

<!-- Error message (assertive) -->
<div role="alert" aria-live="assertive">
  Form submission failed
</div>

<!-- Loading state -->
<div aria-live="polite" aria-busy="true">
  Loading...
</div>
```

### Visually Hidden Content
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Testing Tools

### Automated Testing
```bash
# Lighthouse
npx lighthouse http://localhost:3000 --view

# axe-core (via CLI)
npx @axe-core/cli http://localhost:3000

# Pa11y
npx pa11y http://localhost:3000
```

### Manual Testing Checklist

**Keyboard:**
- [ ] Tab through entire page
- [ ] All interactive elements focusable
- [ ] Focus indicator always visible
- [ ] Tab order is logical
- [ ] No keyboard traps

**Screen Reader:**
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] All content announced correctly
- [ ] Headings provide structure
- [ ] Forms have labels
- [ ] Buttons have clear purposes

**Visual:**
- [ ] Zoom to 200% - content readable
- [ ] Text contrast meets WCAG AA
- [ ] Color not sole indicator of meaning
- [ ] Focus indicators visible

**Semantic:**
- [ ] Valid HTML
- [ ] Proper heading hierarchy
- [ ] Landmarks used correctly
- [ ] ARIA used appropriately

## Common Patterns

### Accessible Button
```html
<button
  type="button"
  aria-label="Close dialog"
  aria-describedby="close-help"
>
  <svg aria-hidden="true">...</svg>
  <span id="close-help" class="sr-only">
    Pressing Escape will also close
  </span>
</button>
```

### Accessible Modal
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">
    Are you sure you want to delete this item?
  </p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

### Accessible Tabs
```html
<div role="tablist" aria-label="Content sections">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="panel-1"
    id="tab-1"
  >
    Tab 1
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="panel-2"
    id="tab-2"
  >
    Tab 2
  </button>
</div>

<div
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"
>
  Content 1
</div>

<div
  role="tabpanel"
  id="panel-2"
  aria-labelledby="tab-2"
  hidden
>
  Content 2
</div>
```

## Compliance Checklist

### Level A (Minimum)
- [ ] Text alternatives for non-text content
- [ ] Captions for audio/video
- [ ] Content can be presented different ways
- [ ] Keyboard accessible
- [ ] Users have time to read and use content
- [ ] No content causes seizures

### Level AA (Required)
- [ ] All Level A criteria
- [ ] Captions for live audio
- [ ] Contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text can be resized to 200%
- [ ] Multiple ways to find pages
- [ ] Headings and labels describe purpose
- [ ] Focus visible
- [ ] Language of page identified

## Philosophy

**Accessibility is not optional—it's a fundamental requirement.**

Design for all abilities. Test with real assistive technologies. Include accessibility from the start, not as an afterthought.

## Additional Resources

See `resources/` directory for:
- Complete ARIA patterns
- Keyboard interaction reference
- Screen reader testing guide
- WCAG checklist
