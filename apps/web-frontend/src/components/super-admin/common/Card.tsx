import { ReactNode } from 'react';
import { cn } from '@/lib/(super-admin)/utils';

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  hover?: boolean;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

export function Card({
  children,
  className,
  title,
  subtitle,
  action,
  footer,
  onClick,
  hover = false,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  emptyIcon,
}: CardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-card border border-border bg-surface shadow-sm p-6',
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-page rounded w-1/4" />
          <div className="h-20 bg-page rounded" />
          <div className="h-4 bg-page rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          'rounded-card border border-border bg-surface shadow-sm p-12 text-center',
          className
        )}
      >
        {emptyIcon && <div className="text-4xl mb-4">{emptyIcon}</div>}
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-sm',
        'flex flex-col',
        hover && 'hover:shadow-md hover:border-info/30 transition-all cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="flex-1">
            {title && <h3 className="text-heading font-heading text-text-primary">{title}</h3>}
            {subtitle && <p className="text-body text-text-secondary mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="flex-1 p-6">{children}</div>
      {footer && <div className="border-t border-border p-4 bg-page/50 rounded-b-card">{footer}</div>}
    </div>
  );
}
