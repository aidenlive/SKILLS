/**
 * Focus Trap Utility
 * Trap keyboard focus within a container (for modals, dialogs, etc.)
 */

class FocusTrap {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      initialFocus: options.initialFocus || null,
      returnFocus: options.returnFocus !== false,
      escapeDeactivates: options.escapeDeactivates !== false,
      ...options
    };

    this.previousFocus = null;
    this.focusableElements = [];
    this.isActive = false;

    this.handleKeydown = this.handleKeydown.bind(this);
  }

  /**
   * Get all focusable elements within container
   */
  getFocusableElements() {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(this.container.querySelectorAll(selector))
      .filter(el => {
        // Filter out hidden elements
        return el.offsetParent !== null &&
               getComputedStyle(el).visibility !== 'hidden';
      });
  }

  /**
   * Activate focus trap
   */
  activate() {
    if (this.isActive) return;

    // Store element that had focus
    this.previousFocus = document.activeElement;

    // Get focusable elements
    this.focusableElements = this.getFocusableElements();

    if (this.focusableElements.length === 0) {
      console.warn('No focusable elements found in container');
      return;
    }

    // Set initial focus
    const initialElement = this.options.initialFocus ||
                          this.focusableElements[0];

    setTimeout(() => {
      if (typeof initialElement === 'function') {
        initialElement().focus();
      } else {
        initialElement.focus();
      }
    }, 0);

    // Add event listeners
    document.addEventListener('keydown', this.handleKeydown);

    this.isActive = true;
  }

  /**
   * Deactivate focus trap
   */
  deactivate() {
    if (!this.isActive) return;

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);

    // Return focus to previous element
    if (this.options.returnFocus && this.previousFocus) {
      setTimeout(() => {
        this.previousFocus.focus();
      }, 0);
    }

    this.isActive = false;
  }

  /**
   * Handle Tab and Escape keys
   */
  handleKeydown(event) {
    // Escape key deactivates
    if (this.options.escapeDeactivates && event.key === 'Escape') {
      event.preventDefault();
      this.deactivate();
      return;
    }

    // Tab key cycling
    if (event.key === 'Tab') {
      this.handleTab(event);
    }
  }

  /**
   * Handle Tab key to cycle focus
   */
  handleTab(event) {
    // Refresh focusable elements in case DOM changed
    this.focusableElements = this.getFocusableElements();

    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement;

    // Shift + Tab (backwards)
    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
    // Tab (forwards)
    else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Update focusable elements (call when DOM changes)
   */
  updateFocusableElements() {
    this.focusableElements = this.getFocusableElements();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FocusTrap;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.FocusTrap = FocusTrap;
}

/**
 * USAGE EXAMPLES:
 *
 * // Create focus trap
 * const modalEl = document.getElementById('modal');
 * const focusTrap = new FocusTrap(modalEl, {
 *   initialFocus: () => document.getElementById('modal-close'),
 *   returnFocus: true,
 *   escapeDeactivates: true,
 * });
 *
 * // Activate when modal opens
 * function openModal() {
 *   modal.hidden = false;
 *   focusTrap.activate();
 * }
 *
 * // Deactivate when modal closes
 * function closeModal() {
 *   focusTrap.deactivate();
 *   modal.hidden = true;
 * }
 *
 * // Update if DOM changes while active
 * function addButton() {
 *   modal.appendChild(newButton);
 *   focusTrap.updateFocusableElements();
 * }
 */
