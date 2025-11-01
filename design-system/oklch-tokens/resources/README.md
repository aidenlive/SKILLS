# OKLCH Tokens Resources

This directory contains helper tools and examples for working with the OKLCH color token system.

## Files

### `theme-switcher.js`
JavaScript class for managing light/dark theme switching with localStorage persistence and system preference detection.

**Usage:**
```javascript
// Toggle theme
themeSwitcher.toggle();

// Set specific theme
themeSwitcher.setTheme('dark');

// Listen for changes
window.addEventListener('themechange', (e) => {
  console.log('Theme:', e.detail.theme);
});
```

### `color-scale-generator.js`
Utility for generating perceptually uniform OKLCH color scales.

**Usage:**
```javascript
// Generate grayscale
const scale = OKLCHScaleGenerator.generateLightnessScale(10);

// Generate themed palette
const palette = OKLCHScaleGenerator.generateThemedPalette();

// Generate CSS variables
const css = OKLCHScaleGenerator.generateCSSVariables(palette.light);
```

### `contrast-calculator.html`
Interactive WCAG contrast ratio calculator for OKLCH colors. Open in browser to check color combinations for accessibility compliance.

**Features:**
- Real-time contrast calculation
- WCAG AA/AAA compliance checking
- Live color preview
- Support for normal and large text

## Quick Start

### 1. Include Theme Switcher in HTML

```html
<script src="resources/theme-switcher.js"></script>
<button onclick="themeSwitcher.toggle()">Toggle Theme</button>
```

### 2. Generate Color Scales

```javascript
import OKLCHScaleGenerator from './resources/color-scale-generator.js';

const tokens = OKLCHScaleGenerator.generateCompleteTokens();
console.log(JSON.stringify(tokens, null, 2));
```

### 3. Check Contrast

Open `contrast-calculator.html` in a browser and enter your OKLCH colors to verify WCAG compliance.

## Related Files

- `/shared/tokens.json` - Complete token system used across all skills
- `../SKILL.md` - Main OKLCH tokens skill documentation
