# Accessibility Check Resources

Tools and references for ensuring WCAG 2.1 Level AA compliance and creating accessible web applications.

## Files

### `wcag-checklist.md`
Complete WCAG 2.1 Level AA compliance checklist with all success criteria organized by principle (Perceivable, Operable, Understandable, Robust).

**Includes:**
- All Level A and Level AA criteria
- Testing procedures
- Common issues and fixes
- Automated and manual testing guidance
- Browser and assistive technology testing

**Usage:**
```markdown
Use as a checklist during development and QA:
- [ ] 1.1.1 Non-text Content - Images have alt text
- [ ] 1.4.3 Contrast (Minimum) - 4.5:1 for normal text
- [ ] 2.1.1 Keyboard - All functionality keyboard accessible
... (and many more)
```

### `aria-patterns.html`
Interactive reference guide with copy-paste ready ARIA patterns and live demos.

**Includes:**
- Disclosure (accordion/collapsible)
- Tabs
- Alert / Live regions
- Dialog / Modal
- Landmark roles
- Form labels and descriptions
- Button states

**Usage:**
Open in browser to see live examples and copy the code snippets for your own components.

### `focus-trap.js`
JavaScript utility class for trapping keyboard focus within a container (essential for modals and dialogs).

**Features:**
- Traps Tab and Shift+Tab within container
- Escape key to deactivate (optional)
- Returns focus to previous element on close
- Dynamically updates focusable elements
- Filters out hidden elements

**Usage:**
```javascript
import FocusTrap from './focus-trap.js';

const modal = document.getElementById('modal');
const focusTrap = new FocusTrap(modal, {
  initialFocus: () => document.getElementById('close-button'),
  returnFocus: true,
  escapeDeactivates: true,
});

// When modal opens
focusTrap.activate();

// When modal closes
focusTrap.deactivate();
```

## Quick Start

### 1. Run Automated Tests

```bash
# Install tools
npm install -D @axe-core/cli pa11y lighthouse

# Run axe
npx @axe-core/cli http://localhost:3000

# Run Pa11y
npx pa11y http://localhost:3000

# Run Lighthouse
npx lighthouse http://localhost:3000 --view
```

### 2. Manual Keyboard Test

1. Close your eyes or turn off your monitor
2. Tab through entire page
3. Verify:
   - All interactive elements reachable
   - Focus indicator always visible
   - Tab order is logical
   - No keyboard traps
   - Escape closes modals

### 3. Screen Reader Test

**Windows (NVDA):**
```
1. Install NVDA (free)
2. Press Insert+Down to start reading
3. Press Tab to navigate interactive elements
4. Press Insert+F7 to see elements list
```

**Mac (VoiceOver):**
```
1. Press Cmd+F5 to start VoiceOver
2. Press Control+Option+Arrow keys to navigate
3. Press Control+Option+U to open rotor
```

### 4. Check Color Contrast

Use the OKLCH contrast calculator:
```
Open: /design-system/oklch-tokens/resources/contrast-calculator.html

Enter foreground: oklch(20% 0 0)
Enter background: oklch(98% 0 0)

Verify: ✓ Meets WCAG AA (4.5:1 minimum)
```

## Common Fixes

### Missing Alt Text
```html
<!-- ❌ Bad -->
<img src="photo.jpg">

<!-- ✅ Good -->
<img src="photo.jpg" alt="Team meeting in conference room">

<!-- ✅ Decorative -->
<img src="decoration.svg" alt="">
```

### Missing Form Labels
```html
<!-- ❌ Bad -->
<input type="text" placeholder="Email">

<!-- ✅ Good -->
<label for="email">Email</label>
<input type="email" id="email">
```

### Poor Focus Indicator
```css
/* ❌ Bad */
:focus {
  outline: none;
}

/* ✅ Good */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### No Keyboard Access to Modal
```javascript
// ❌ Bad
function openModal() {
  modal.style.display = 'block';
}

// ✅ Good
const focusTrap = new FocusTrap(modal);

function openModal() {
  modal.style.display = 'block';
  modal.removeAttribute('hidden');
  focusTrap.activate();
}

function closeModal() {
  focusTrap.deactivate();
  modal.setAttribute('hidden', '');
}
```

## Testing Workflow

### During Development
1. Write semantic HTML first
2. Add ARIA only when needed
3. Test with keyboard after each component
4. Run automated tests before committing

### Before Release
1. Complete WCAG checklist
2. Test with screen reader
3. Test at 200% zoom
4. Test in high contrast mode
5. Run full accessibility audit
6. Test on mobile devices

### Continuous Monitoring
1. Add Pa11y to CI/CD pipeline
2. Run Lighthouse in build process
3. Monitor user feedback
4. Regular manual audits

## Tools Reference

### Browser Extensions
- **axe DevTools** - Chrome/Edge/Firefox
- **WAVE** - Chrome/Edge/Firefox
- **Accessibility Insights** - Chrome/Edge

### CLI Tools
```bash
# axe-core
npx @axe-core/cli [url]

# Pa11y
npx pa11y [url]

# Lighthouse
npx lighthouse [url] --only-categories=accessibility
```

### Screen Readers
- **NVDA** - Free (Windows)
- **JAWS** - Commercial (Windows)
- **VoiceOver** - Built-in (Mac/iOS)
- **TalkBack** - Built-in (Android)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11Y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)

## Related Files

- `/design-system/oklch-tokens/resources/contrast-calculator.html` - Color contrast checker
- `../SKILL.md` - Main accessibility skill documentation
- `/frontend/component-library/resources/` - Accessible component examples
