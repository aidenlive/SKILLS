/**
 * app.js - Main application module
 * ES Module for static web projects
 * Copy to /scripts/app.js
 */

// ============================================
// UI Helpers Module
// ============================================

/**
 * Simple DOM helper utilities
 */
export const DOM = {
  /**
   * Query selector shorthand
   */
  qs: (selector, parent = document) => parent.querySelector(selector),

  /**
   * Query selector all shorthand
   */
  qsa: (selector, parent = document) => Array.from(parent.querySelectorAll(selector)),

  /**
   * Add event listener with optional delegation
   */
  on: (element, event, selector, handler) => {
    if (typeof selector === 'function') {
      handler = selector;
      element.addEventListener(event, handler);
    } else {
      element.addEventListener(event, (e) => {
        if (e.target.matches(selector)) {
          handler.call(e.target, e);
        }
      });
    }
  },

  /**
   * Create element with attributes
   */
  create: (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'class') {
        el.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          el.dataset[dataKey] = dataValue;
        });
      } else {
        el.setAttribute(key, value);
      }
    });
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else {
        el.appendChild(child);
      }
    });
    return el;
  }
};

// ============================================
// Theme Switcher
// ============================================

export class ThemeSwitcher {
  constructor() {
    this.storageKey = 'theme';
    this.darkClass = 'dark-mode';
    this.init();
  }

  init() {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem(this.storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      this.setTheme('dark');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add(this.darkClass);
    } else {
      document.documentElement.classList.remove(this.darkClass);
    }
    localStorage.setItem(this.storageKey, theme);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  toggle() {
    const isDark = document.documentElement.classList.contains(this.darkClass);
    this.setTheme(isDark ? 'light' : 'dark');
  }

  getTheme() {
    return document.documentElement.classList.contains(this.darkClass) ? 'dark' : 'light';
  }
}

// ============================================
// Mobile Navigation
// ============================================

export class MobileNav {
  constructor(navSelector, toggleSelector) {
    this.nav = DOM.qs(navSelector);
    this.toggle = DOM.qs(toggleSelector);
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.nav || !this.toggle) return;

    // Toggle button click
    this.toggle.addEventListener('click', () => this.toggleMenu());

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.nav.contains(e.target) && !this.toggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Close on link click
    DOM.qsa('a', this.nav).forEach(link => {
      link.addEventListener('click', () => {
        if (this.isOpen) {
          this.closeMenu();
        }
      });
    });
  }

  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    this.isOpen = true;
    this.nav.classList.add('is-open');
    this.toggle.setAttribute('aria-expanded', 'true');
  }

  closeMenu() {
    this.isOpen = false;
    this.nav.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
  }
}

// ============================================
// Modal Dialog
// ============================================

export class Modal {
  constructor(modalId) {
    this.modal = DOM.qs(`#${modalId}`);
    this.overlay = null;
    this.closeBtn = null;
    this.previouslyFocused = null;
    this.init();
  }

  init() {
    if (!this.modal) return;

    this.overlay = DOM.qs('.modal-overlay', this.modal);
    this.closeBtn = DOM.qs('[data-modal-close]', this.modal);

    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close on overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Trap focus
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isOpen()) {
        this.trapFocus(e);
      }
    });
  }

  open() {
    this.previouslyFocused = document.activeElement;
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    const focusable = this.getFocusableElements();
    if (focusable.length) {
      focusable[0].focus();
    }
  }

  close() {
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Restore focus
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }

  isOpen() {
    return this.modal.classList.contains('is-open');
  }

  getFocusableElements() {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    return DOM.qsa(selectors.join(','), this.modal);
  }

  trapFocus(e) {
    const focusable = this.getFocusableElements();
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  }
}

// ============================================
// Form Validation
// ============================================

export class FormValidator {
  constructor(formSelector) {
    this.form = DOM.qs(formSelector);
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      if (!this.validate()) {
        e.preventDefault();
      }
    });

    // Real-time validation on blur
    DOM.qsa('input, textarea, select', this.form).forEach(field => {
      field.addEventListener('blur', () => {
        this.validateField(field);
      });
    });
  }

  validate() {
    let isValid = true;
    const fields = DOM.qsa('input, textarea, select', this.form);

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.required;
    let error = '';

    // Required check
    if (required && !value) {
      error = 'This field is required';
    }

    // Email validation
    if (type === 'email' && value && !this.isValidEmail(value)) {
      error = 'Please enter a valid email address';
    }

    // URL validation
    if (type === 'url' && value && !this.isValidURL(value)) {
      error = 'Please enter a valid URL';
    }

    // Pattern validation
    if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
      error = field.title || 'Please match the requested format';
    }

    // Min/Max length
    if (field.minLength && value.length < field.minLength) {
      error = `Minimum ${field.minLength} characters required`;
    }

    if (field.maxLength && value.length > field.maxLength) {
      error = `Maximum ${field.maxLength} characters allowed`;
    }

    this.showError(field, error);
    return !error;
  }

  showError(field, message) {
    // Remove existing error
    const existingError = DOM.qs(`#${field.id}-error`);
    if (existingError) {
      existingError.remove();
    }

    // Clear error state
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');

    // Add new error if message exists
    if (message) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');

      const errorEl = DOM.create('p', {
        id: `${field.id}-error`,
        class: 'error-text',
        role: 'alert'
      }, [message]);

      field.parentElement.appendChild(errorEl);
    }
  }

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// Toast Notifications
// ============================================

export class Toast {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    let container = DOM.qs('.toast-container');
    if (!container) {
      container = DOM.create('div', {
        class: 'toast-container',
        'aria-live': 'polite',
        'aria-atomic': 'true'
      });
      document.body.appendChild(container);
    }
    return container;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = DOM.create('div', {
      class: `toast toast-${type}`,
      role: 'status'
    }, [message]);

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    // Auto-remove
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }
}

// ============================================
// Data Fetcher
// ============================================

export async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// ============================================
// Initialize App
// ============================================

export function initApp() {
  // Theme switcher
  const themeSwitcher = new ThemeSwitcher();
  const themeToggle = DOM.qs('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => themeSwitcher.toggle());
  }

  // Mobile navigation
  new MobileNav('.nav-primary', '.nav-toggle');

  // Forms
  DOM.qsa('form').forEach(form => {
    new FormValidator(`#${form.id}`);
  });

  // External links (open in new tab)
  DOM.qsa('a[href^="http"]').forEach(link => {
    if (!link.hostname.includes(window.location.hostname)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  console.log('✅ App initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
