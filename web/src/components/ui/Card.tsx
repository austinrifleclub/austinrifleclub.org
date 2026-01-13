/**
 * Reusable Card Component
 *
 * A consistent card design for use throughout the application.
 * Supports multiple variants and interactive states.
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantClasses = {
  default: 'card card-default',
  elevated: 'card card-elevated',
  outlined: 'card card-outlined',
};

export function Card({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  padding = 'md',
  as: Component = 'div',
}: CardProps) {
  const interactiveClass = interactive ? 'card-interactive' : '';

  return (
    <Component
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClass} ${className}`}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`}>
      <div className="flex-1">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={`card-title ${className}`}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return <p className={`card-description ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
}

// Compound component for badge display in cards
interface CardBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'premium' | 'neutral';
}

export function CardBadge({ children, variant = 'neutral' }: CardBadgeProps) {
  return (
    <span className={`card-badge card-badge-${variant}`}>
      {children}
    </span>
  );
}
