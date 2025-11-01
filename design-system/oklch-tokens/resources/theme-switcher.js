/**
 * OKLCH Theme Switcher
 * Manages light/dark theme switching with localStorage persistence
 * and system preference detection
 */

class ThemeSwitcher {
  constructor() {
    this.themeKey = 'theme';
    this.themes = ['light', 'dark'];
    this.currentTheme = this.getPreferredTheme();

    this.init();
  }

  /**
   * Initialize theme switcher
   */
  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);

    // Listen for system theme changes
    this.watchSystemTheme();
  }

  /**
   * Get preferred theme from localStorage or system
   */
  getPreferredTheme() {
    const stored = localStorage.getItem(this.themeKey);
    if (stored && this.themes.includes(stored)) {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /**
   * Set theme on document
   */
  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.error(`Invalid theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.themeKey, theme);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme }
    }));
  }

  /**
   * Toggle between light and dark
   */
  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Watch for system theme changes
   */
  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem(this.themeKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Clear stored preference (revert to system)
   */
  clearPreference() {
    localStorage.removeItem(this.themeKey);
    this.currentTheme = this.getPreferredTheme();
    this.setTheme(this.currentTheme);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeSwitcher;
}

// Auto-initialize if not using modules
if (typeof window !== 'undefined') {
  window.ThemeSwitcher = ThemeSwitcher;

  // Create global instance
  window.themeSwitcher = new ThemeSwitcher();
}

/**
 * USAGE EXAMPLES:
 *
 * // Toggle theme
 * themeSwitcher.toggle();
 *
 * // Set specific theme
 * themeSwitcher.setTheme('dark');
 *
 * // Get current theme
 * const current = themeSwitcher.getTheme();
 *
 * // Listen for theme changes
 * window.addEventListener('themechange', (e) => {
 *   console.log('Theme changed to:', e.detail.theme);
 * });
 *
 * // Clear user preference (revert to system)
 * themeSwitcher.clearPreference();
 */
