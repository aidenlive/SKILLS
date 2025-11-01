/**
 * Card Component
 * Flexible content container with optional header and footer
 */

import './Card.css';

export function Card({
  children,
  header,
  footer,
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  onClick,
  className = '',
  ...props
}) {
  const cardClassName = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hoverable && 'card-hoverable',
    onClick && 'card-clickable',
    className,
  ].filter(Boolean).join(' ');

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={cardClassName}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      {...props}
    >
      {header && <div className="card-header">{header}</div>}

      <div className="card-content">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </Tag>
  );
}

/**
 * USAGE EXAMPLES:
 *
 * // Basic card
 * <Card>
 *   <p>Card content</p>
 * </Card>
 *
 * // Card with header and footer
 * <Card
 *   header={<h3>Card Title</h3>}
 *   footer={<Button>Action</Button>}
 * >
 *   <p>Card content</p>
 * </Card>
 *
 * // Clickable card
 * <Card hoverable onClick={() => navigate('/details')}>
 *   <h3>Click me</h3>
 *   <p>This entire card is clickable</p>
 * </Card>
 *
 * // Elevated variant
 * <Card variant="elevated">
 *   <p>Elevated card with shadow</p>
 * </Card>
 *
 * // Compact padding
 * <Card padding="compact">
 *   <p>Less padding</p>
 * </Card>
 */
