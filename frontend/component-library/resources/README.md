# Component Library Resources

Production-ready React components following OKLCH token system and accessibility best practices.

## Components

### Button.jsx + Button.css
Accessible button component with multiple variants and states.

**Features:**
- Variants: primary, secondary, tertiary, danger
- Sizes: small, medium, large
- States: disabled, loading
- Icons with left/right positioning
- Full keyboard accessibility
- Focus indicators

**Usage:**
```jsx
import { Button } from './resources/Button';

<Button variant="primary">Click me</Button>
<Button variant="secondary" size="large">Large Button</Button>
<Button loading>Processing...</Button>
<Button icon={<PlusIcon />}>Add Item</Button>
```

### Modal.jsx + Modal.css
Accessible modal dialog with focus management and keyboard navigation.

**Features:**
- Focus trap
- Escape key to close
- Click outside to close (optional)
- Restores focus on close
- Prevents body scroll when open
- Multiple sizes: small, medium, large
- Portal rendering

**Usage:**
```jsx
import { Modal } from './resources/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="secondary" onClick={close}>Cancel</Button>
      <Button variant="primary" onClick={confirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure?</p>
</Modal>
```

### Card.jsx + Card.css
Flexible content container for grouping related information.

**Features:**
- Variants: default, elevated, flat
- Padding options: compact, medium, spacious
- Optional header and footer
- Hoverable state
- Clickable option (entire card as button)

**Usage:**
```jsx
import { Card } from './resources/Card';

<Card
  header={<h3>Card Title</h3>}
  footer={<Button>Action</Button>}
>
  <p>Card content</p>
</Card>

<Card hoverable onClick={() => navigate('/details')}>
  <h3>Clickable Card</h3>
</Card>
```

## CSS Tokens

All components use CSS custom properties from `/shared/tokens.json`:

```css
/* Colors */
--color-bg
--color-surface
--color-border
--color-text-primary
--color-accent

/* Spacing */
--space-2, --space-4, --space-6, --space-8

/* Typography */
--text-sm, --text-base, --text-lg, --text-xl

/* Borders */
--radius-base, --radius-md, --radius-lg

/* Shadows */
--shadow-md, --shadow-lg, --shadow-xl

/* Transitions */
--transition-fast, --transition-base
```

## Setup

### 1. Install Dependencies

```bash
npm install react react-dom
```

### 2. Import CSS Variables

```css
/* In your root CSS file */
@import url('/shared/tokens.css');

:root {
  --color-bg: oklch(98% 0 0);
  --color-surface: oklch(96% 0 0);
  /* ... other tokens */
}
```

### 3. Import Components

```jsx
import { Button } from './resources/Button';
import { Modal } from './resources/Modal';
import { Card } from './resources/Card';
```

## Accessibility

All components follow WCAG 2.1 Level AA standards:

- ✓ Keyboard navigation support
- ✓ Proper ARIA attributes
- ✓ Focus management
- ✓ Color contrast compliance
- ✓ Screen reader friendly

## Customization

Components are designed to be customizable via CSS variables:

```css
/* Override button colors */
.btn-primary {
  --btn-bg: oklch(40% 0.12 250); /* Custom blue */
  --btn-text: oklch(100% 0 0);
}

/* Override card spacing */
.card {
  --card-padding: var(--space-8);
}
```

## Testing

```jsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## Related Files

- `/shared/tokens.json` - Design token system
- `../SKILL.md` - Component library skill documentation
- `/design-system/oklch-tokens/` - Color system details
