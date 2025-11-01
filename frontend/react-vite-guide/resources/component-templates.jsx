/**
 * React Component Templates
 * Production-ready functional components with hooks
 * Copy these to /src/components/
 */

import { useState, useRef, useEffect } from 'react';

// ============================================
// BUTTON COMPONENT
// ============================================

/**
 * Button component with variants and sizes
 * Usage:
 *   <Button variant="primary" size="lg" onClick={handleClick}>
 *     Click Me
 *   </Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    disabled && 'disabled'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}>
      {children}
    </button>
  );
}

// ============================================
// CARD COMPONENT
// ============================================

/**
 * Card component with optional header, footer, and variants
 * Usage:
 *   <Card variant="elevated">
 *     <Card.Header>
 *       <Card.Title>Title</Card.Title>
 *     </Card.Header>
 *     <Card.Body>Content here</Card.Body>
 *     <Card.Footer>Footer content</Card.Footer>
 *   </Card>
 */
export function Card({ children, variant, className, ...props }) {
  const classes = [
    'card',
    variant && `card-${variant}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className, ...props }) {
  return (
    <div className={`card-header ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className, as: Component = 'h3', ...props }) {
  return (
    <Component className={`card-title ${className || ''}`} {...props}>
      {children}
    </Component>
  );
};

Card.Body = function CardBody({ children, className, ...props }) {
  return (
    <div className={`card-body ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className, ...props }) {
  return (
    <div className={`card-footer ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

// ============================================
// MODAL COMPONENT
// ============================================

/**
 * Modal dialog with focus trap and keyboard handling
 * Usage:
 *   const [isOpen, setIsOpen] = useState(false);
 *   <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
 *     <p>Modal content</p>
 *   </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  ...props
}) {
  const modalRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Save previously focused element
      previouslyFocusedRef.current = document.activeElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus modal
      modalRef.current?.focus();

      // Cleanup
      return () => {
        document.body.style.overflow = '';
        previouslyFocusedRef.current?.focus();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title">
      <div
        ref={modalRef}
        className={`modal-content modal-${size}`}
        tabIndex={-1}
        {...props}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// INPUT COMPONENT
// ============================================

/**
 * Form input with label, error handling, and validation
 * Usage:
 *   <Input
 *     label="Email"
 *     type="email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *     error="Invalid email"
 *     required
 *   />
 */
export function Input({
  label,
  error,
  helperText,
  id,
  required,
  className,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`input-wrapper ${className || ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span aria-label="required"> *</span>}
        </label>
      )}

      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        {...props}
      />

      {error && (
        <p id={errorId} className="input-error-text" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="input-helper-text">{helperText}</p>
      )}
    </div>
  );
}

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

/**
 * Loading spinner with size variants
 * Usage:
 *   <Spinner size="lg" />
 */
export function Spinner({ size = 'md', className, ...props }) {
  return (
    <div
      className={`spinner spinner-${size} ${className || ''}`}
      role="status"
      aria-label="Loading"
      {...props}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ============================================
// ALERT/TOAST COMPONENT
// ============================================

/**
 * Alert/Toast notification component
 * Usage:
 *   <Alert variant="success" onClose={() => setShowAlert(false)}>
 *     Operation completed successfully!
 *   </Alert>
 */
export function Alert({
  children,
  variant = 'info',
  onClose,
  className,
  ...props
}) {
  return (
    <div
      className={`alert alert-${variant} ${className || ''}`}
      role="alert"
      {...props}>
      <div className="alert-content">{children}</div>
      {onClose && (
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert">
          ×
        </button>
      )}
    </div>
  );
}

// ============================================
// TABS COMPONENT
// ============================================

/**
 * Tabs component with keyboard navigation
 * Usage:
 *   <Tabs defaultTab="tab1">
 *     <Tabs.List>
 *       <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
 *       <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
 *     </Tabs.List>
 *     <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
 *     <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
 *   </Tabs>
 */
export function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="tabs">
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
}

const TabsContext = React.createContext();

Tabs.List = function TabsList({ children, ...props }) {
  return (
    <div className="tabs-list" role="tablist" {...props}>
      {children}
    </div>
  );
};

Tabs.Tab = function Tab({ id, children, ...props }) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === id;

  return (
    <button
      className={`tab ${isActive ? 'tab-active' : ''}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      onClick={() => setActiveTab(id)}
      {...props}>
      {children}
    </button>
  );
};

Tabs.Panel = function TabPanel({ id, children, ...props }) {
  const { activeTab } = React.useContext(TabsContext);
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      className="tab-panel"
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      id={`panel-${id}`}
      {...props}>
      {children}
    </div>
  );
};

// ============================================
// DROPDOWN COMPONENT
// ============================================

/**
 * Dropdown component with keyboard navigation
 * Usage:
 *   <Dropdown trigger={<Button>Open Menu</Button>}>
 *     <Dropdown.Item onClick={() => console.log('Item 1')}>
 *       Item 1
 *     </Dropdown.Item>
 *     <Dropdown.Item>Item 2</Dropdown.Item>
 *   </Dropdown>
 */
export function Dropdown({ trigger, children, align = 'left' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={`dropdown-menu dropdown-${align}`} role="menu">
          {children}
        </div>
      )}
    </div>
  );
}

Dropdown.Item = function DropdownItem({ children, onClick, ...props }) {
  return (
    <button
      className="dropdown-item"
      role="menuitem"
      onClick={onClick}
      {...props}>
      {children}
    </button>
  );
};

// ============================================
// CONTAINER/LAYOUT COMPONENTS
// ============================================

/**
 * Container component for consistent page width
 */
export function Container({ children, size = 'xl', className, ...props }) {
  return (
    <div className={`container container-${size} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

/**
 * Stack component for vertical spacing
 */
export function Stack({ children, spacing = 'md', className, ...props }) {
  return (
    <div className={`stack stack-${spacing} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

/**
 * Grid component for responsive layouts
 */
export function Grid({ children, cols = 3, gap = 'md', className, ...props }) {
  return (
    <div
      className={`grid grid-cols-${cols} grid-gap-${gap} ${className || ''}`}
      {...props}>
      {children}
    </div>
  );
}
