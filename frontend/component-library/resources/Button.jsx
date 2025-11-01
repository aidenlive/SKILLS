/**
 * Button Component
 * Accessible button with multiple variants and states
 */

import './Button.css';

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const className = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled && 'btn-disabled',
    loading && 'btn-loading',
    icon && 'btn-with-icon',
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner" aria-label="Loading">
          <svg viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="60"
              strokeDashoffset="30"
            />
          </svg>
        </span>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left" aria-hidden="true">
          {icon}
        </span>
      )}

      <span className="btn-text">{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}

/**
 * USAGE EXAMPLES:
 *
 * // Primary button
 * <Button variant="primary">Click me</Button>
 *
 * // Secondary button
 * <Button variant="secondary">Cancel</Button>
 *
 * // Button with icon
 * <Button icon={<PlusIcon />}>Add Item</Button>
 *
 * // Loading state
 * <Button loading>Processing...</Button>
 *
 * // Disabled state
 * <Button disabled>Not Available</Button>
 *
 * // Different sizes
 * <Button size="small">Small</Button>
 * <Button size="medium">Medium</Button>
 * <Button size="large">Large</Button>
 */
