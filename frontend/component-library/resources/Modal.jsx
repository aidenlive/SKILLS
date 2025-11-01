/**
 * Modal Component
 * Accessible modal dialog with focus trap and escape key handling
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement;

      // Focus first focusable element in modal
      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.[0]?.focus();
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousFocusRef.current?.focus();

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

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
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="modal-content">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/**
 * USAGE EXAMPLES:
 *
 * // Basic modal
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Action">
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 *
 * // Modal with footer
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Delete Item"
 *   footer={
 *     <>
 *       <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *         Cancel
 *       </Button>
 *       <Button variant="danger" onClick={handleDelete}>
 *         Delete
 *       </Button>
 *     </>
 *   }
 * >
 *   <p>This action cannot be undone.</p>
 * </Modal>
 *
 * // Large modal
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Details" size="large">
 *   <DetailedContent />
 * </Modal>
 */
