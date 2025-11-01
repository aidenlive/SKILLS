/**
 * OKLCH Color Scale Generator
 * Generate perceptually uniform lightness scales
 */

class OKLCHScaleGenerator {
  /**
   * Generate a lightness scale
   * @param {number} steps - Number of steps in the scale
   * @param {number} chroma - Chroma value (0 for grayscale)
   * @param {number} hue - Hue value (0-360)
   * @param {boolean} reverse - Reverse the scale (dark to light)
   * @returns {Array} Array of OKLCH color strings
   */
  static generateLightnessScale(steps = 10, chroma = 0, hue = 0, reverse = false) {
    const scale = [];

    for (let i = 0; i < steps; i++) {
      const lightness = (100 / (steps - 1)) * i;
      const color = `oklch(${lightness.toFixed(1)}% ${chroma} ${hue})`;
      scale.push(color);
    }

    return reverse ? scale.reverse() : scale;
  }

  /**
   * Generate monochrome grayscale
   * @param {number} steps - Number of steps
   * @returns {Object} Object with numeric keys and OKLCH values
   */
  static generateGrayscale(steps = 11) {
    const scale = {};
    const values = [0, 2, 4, 6, 12, 16, 24, 40, 55, 80, 100];

    values.forEach(value => {
      scale[value] = `oklch(${100 - value}% 0 0)`;
    });

    return scale;
  }

  /**
   * Generate themed palette (light + dark)
   * @returns {Object} Complete light/dark palette
   */
  static generateThemedPalette() {
    return {
      light: {
        bg: 'oklch(98% 0 0)',
        surface: 'oklch(96% 0 0)',
        'surface-secondary': 'oklch(94% 0 0)',
        border: 'oklch(88% 0 0)',
        'border-subtle': 'oklch(92% 0 0)',
        'text-primary': 'oklch(20% 0 0)',
        'text-secondary': 'oklch(45% 0 0)',
        'text-tertiary': 'oklch(60% 0 0)',
        accent: 'oklch(30% 0 0)',
        'accent-hover': 'oklch(25% 0 0)',
      },
      dark: {
        bg: 'oklch(15% 0 0)',
        surface: 'oklch(18% 0 0)',
        'surface-secondary': 'oklch(22% 0 0)',
        border: 'oklch(28% 0 0)',
        'border-subtle': 'oklch(24% 0 0)',
        'text-primary': 'oklch(95% 0 0)',
        'text-secondary': 'oklch(70% 0 0)',
        'text-tertiary': 'oklch(55% 0 0)',
        accent: 'oklch(85% 0 0)',
        'accent-hover': 'oklch(90% 0 0)',
      }
    };
  }

  /**
   * Generate signal colors (success, error, warning, info)
   * @param {string} theme - 'light' or 'dark'
   * @returns {Object} Signal color palette
   */
  static generateSignalColors(theme = 'light') {
    if (theme === 'light') {
      return {
        success: 'oklch(60% 0.12 145)',
        'success-bg': 'oklch(95% 0.03 145)',
        'success-border': 'oklch(80% 0.10 145)',
        error: 'oklch(55% 0.15 25)',
        'error-bg': 'oklch(95% 0.03 25)',
        'error-border': 'oklch(80% 0.10 25)',
        warning: 'oklch(65% 0.12 85)',
        'warning-bg': 'oklch(95% 0.03 85)',
        'warning-border': 'oklch(85% 0.10 85)',
        info: 'oklch(60% 0.12 250)',
        'info-bg': 'oklch(95% 0.03 250)',
        'info-border': 'oklch(80% 0.10 250)',
      };
    } else {
      return {
        success: 'oklch(70% 0.15 145)',
        'success-bg': 'oklch(20% 0.05 145)',
        'success-border': 'oklch(35% 0.10 145)',
        error: 'oklch(70% 0.20 25)',
        'error-bg': 'oklch(20% 0.05 25)',
        'error-border': 'oklch(35% 0.10 25)',
        warning: 'oklch(75% 0.15 85)',
        'warning-bg': 'oklch(25% 0.05 85)',
        'warning-border': 'oklch(40% 0.10 85)',
        info: 'oklch(70% 0.15 250)',
        'info-bg': 'oklch(20% 0.05 250)',
        'info-border': 'oklch(35% 0.10 250)',
      };
    }
  }

  /**
   * Generate CSS custom properties
   * @param {Object} palette - Color palette object
   * @param {string} prefix - CSS variable prefix
   * @returns {string} CSS custom properties
   */
  static generateCSSVariables(palette, prefix = '--color') {
    let css = ':root {\n';

    for (const [key, value] of Object.entries(palette)) {
      if (typeof value === 'object') {
        // Nested object (like light/dark themes)
        for (const [subKey, subValue] of Object.entries(value)) {
          css += `  ${prefix}-${key}-${subKey}: ${subValue};\n`;
        }
      } else {
        css += `  ${prefix}-${key}: ${value};\n`;
      }
    }

    css += '}\n';
    return css;
  }

  /**
   * Generate complete token file
   * @returns {Object} Complete token structure
   */
  static generateCompleteTokens() {
    return {
      colors: {
        light: this.generateThemedPalette().light,
        dark: this.generateThemedPalette().dark,
        signals: {
          light: this.generateSignalColors('light'),
          dark: this.generateSignalColors('dark'),
        }
      },
      grayscale: this.generateGrayscale(),
    };
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OKLCHScaleGenerator;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.OKLCHScaleGenerator = OKLCHScaleGenerator;
}

/**
 * USAGE EXAMPLES:
 *
 * // Generate 10-step grayscale
 * const grayscale = OKLCHScaleGenerator.generateLightnessScale(10);
 * console.log(grayscale);
 * // ['oklch(0% 0 0)', 'oklch(11.1% 0 0)', ..., 'oklch(100% 0 0)']
 *
 * // Generate themed palette
 * const palette = OKLCHScaleGenerator.generateThemedPalette();
 *
 * // Generate signal colors
 * const signals = OKLCHScaleGenerator.generateSignalColors('dark');
 *
 * // Generate CSS variables
 * const css = OKLCHScaleGenerator.generateCSSVariables(palette.light);
 * console.log(css);
 *
 * // Generate complete token file
 * const tokens = OKLCHScaleGenerator.generateCompleteTokens();
 * console.log(JSON.stringify(tokens, null, 2));
 */
