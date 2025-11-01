---
name: component-library
description: Create reusable UI components following OKLCH token system, no flex-wrap rule, and monochrome aesthetic. Use when designing component libraries, design systems, or building UI component collections.
version: 1.0.0
---

# Component Library Guide

## Purpose

Build reusable UI components with consistent design tokens, accessibility patterns, and monochrome aesthetics. Production-ready components for modern web applications.

## When to Use This Skill

- Creating component libraries or design systems
- Building reusable UI component collections
- Implementing design tokens and theming
- Developing accessible, consistent interfaces
- Documenting component APIs

## Core Principles

- **Token-Driven:** All visual properties derive from OKLCH design tokens
- **Accessibility First:** WCAG compliance built into every component
- **Composable:** Small, focused components that combine well
- **Responsive:** Mobile-first with no flex-wrap
- **Documented:** Clear props, examples, and usage guidelines

## Component Categories

### Layout Components
- **Container:** Max-width wrapper with responsive padding
- **Grid:** 24-column grid system with 4px spacing scale
- **Stack:** Vertical spacing with consistent rhythm
- **Cluster:** Horizontal grouping with overflow handling

### Interactive Components
- **Button:** Primary, secondary, tertiary variants
- **Input:** Text, number, email, password fields
- **Select:** Dropdown with keyboard navigation
- **Checkbox/Radio:** Accessible form controls

### Display Components
- **Card:** Content container with optional header/footer
- **Modal:** Accessible dialog with focus trap
- **Toast:** Notification system with ARIA live regions
- **Badge:** Status indicator with semantic colors

## Component Structure

```
/components
 ├─ /Button
 │   ├─ Button.jsx
 │   ├─ Button.module.css
 │   ├─ Button.test.jsx
 │   └─ Button.stories.jsx
 ├─ /Card
 ├─ /Modal
 └─ ...
```

## Component Template

```jsx
/**
 * Button component with variants and accessibility features
 *
 * @param {string} variant - 'primary' | 'secondary' | 'tertiary'
 * @param {boolean} disabled - Disabled state
 * @param {ReactNode} children - Button content
 */
export function Button({
  variant = 'primary',
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Design Token Usage

### Colors (OKLCH)
```css
.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  border: none;
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

### Spacing
```css
.btn {
  padding: var(--space-3) var(--space-6);
  gap: var(--space-2);
  border-radius: var(--radius-2);
}
```

### Typography
```css
.btn {
  font-size: var(--text-base);
  font-weight: 500;
  line-height: 1.5;
}
```

## Accessibility Requirements

### Interactive Elements
- Visible focus indicators
- Keyboard navigation support
- Proper ARIA labels and roles
- Screen reader announcements

### Forms
- Associated labels for all inputs
- Error messages with ARIA
- Required field indicators
- Validation feedback

### Dialogs & Modals
- Focus trap when open
- ESC key to close
- Return focus on close
- ARIA modal role

## Responsive Patterns

### Mobile-First Approach
```css
/* Base: Mobile 320px+ */
.card {
  padding: var(--space-4);
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .card {
    padding: var(--space-6);
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .card {
    padding: var(--space-8);
  }
}
```

### No Flex-Wrap
```css
/* ❌ Avoid */
.nav {
  display: flex;
  flex-wrap: wrap;
}

/* ✅ Use scroll instead */
.nav {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

## Testing Strategy

### Unit Tests
- Props rendering correctly
- Event handlers firing
- State changes working
- Edge cases handled

### Accessibility Tests
- Keyboard navigation
- ARIA attributes present
- Focus management
- Screen reader compatibility

### Visual Tests
- Storybook snapshot tests
- Responsive breakpoints
- Dark mode compatibility
- High contrast mode

## Documentation Format

### Component API
```markdown
## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Visual style variant |
| disabled | boolean | false | Disabled state |
| children | ReactNode | - | Button content |

## Examples

### Primary Button
[code example]

### With Icon
[code example]
```

## Storybook Setup

```jsx
// Button.stories.jsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary'] }
  }
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Click me'
  }
};
```

## Philosophy

**Token-first design, accessibility by default, composable through simplicity.**

Every component is a building block. Consistent, predictable, production-ready always.

## Additional Resources

See `resources/` directory for:
- Complete component examples
- Accessibility patterns
- Token setup guide
- Storybook configuration
