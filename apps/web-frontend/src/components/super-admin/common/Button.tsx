import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/(super-admin)/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  as?: 'button' | 'a';
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      className,
      disabled,
      leftIcon,
      rightIcon,
      as = 'button',
      href,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-info text-white hover:bg-info/90 focus:ring-info/50',
      secondary: 'bg-text-secondary text-white hover:bg-text-secondary/90 focus:ring-text-secondary/50',
      outline: 'border border-border bg-transparent text-text-primary hover:bg-page hover:border-text-secondary focus:ring-info/50',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-page focus:ring-info/50',
      danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger/50',
      success: 'bg-success text-white hover:bg-success/90 focus:ring-success/50',
      warning: 'bg-warning text-white hover:bg-warning/90 focus:ring-warning/50',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const content = (
      <>
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {leftIcon && !loading && leftIcon}
        {children}
        {rightIcon && !loading && rightIcon}
      </>
    );

    if (as === 'a' && href) {
      return (
        <a
          href={href}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className
          )}
          {...(props as any)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
