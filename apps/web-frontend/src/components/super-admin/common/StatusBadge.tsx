import { cn } from '@/lib/(super-admin)/utils';

export type StatusType = 
  | 'active' | 'inactive' | 'pending'
  | 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED'
  | 'online' | 'offline' | 'degraded'
  | 'healthy' | 'warn' | 'critical'
  | 'paid' | 'overdue' | 'failed'
  | 'success' | 'info' | 'warning' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { dot: string; bg: string; text: string; border: string }> = {
  // Admin statuses
  active: {
    dot: 'bg-success',
    bg: 'bg-success-bg',
    text: 'text-success',
    border: 'border-success/30',
  },
  inactive: {
    dot: 'bg-text-tertiary',
    bg: 'bg-page',
    text: 'text-text-secondary',
    border: 'border-border',
  },
  pending: {
    dot: 'bg-warning',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  
  // Tenant statuses
  ACTIVE: {
    dot: 'bg-success',
    bg: 'bg-success-bg',
    text: 'text-success',
    border: 'border-success/30',
  },
  TRIAL: {
    dot: 'bg-warning',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  SUSPENDED: {
    dot: 'bg-danger',
    bg: 'bg-danger-bg',
    text: 'text-danger',
    border: 'border-danger/30',
  },
  CANCELLED: {
    dot: 'bg-text-tertiary',
    bg: 'bg-page',
    text: 'text-text-secondary',
    border: 'border-border',
  },
  
  // Service statuses
  online: {
    dot: 'bg-success',
    bg: 'bg-success-bg',
    text: 'text-success',
    border: 'border-success/30',
  },
  offline: {
    dot: 'bg-danger',
    bg: 'bg-danger-bg',
    text: 'text-danger',
    border: 'border-danger/30',
  },
  degraded: {
    dot: 'bg-warning',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  
  // Health statuses
  healthy: {
    dot: 'bg-success',
    bg: 'bg-success-bg',
    text: 'text-success',
    border: 'border-success/30',
  },
  warn: {
    dot: 'bg-warning',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  critical: {
    dot: 'bg-danger',
    bg: 'bg-danger-bg',
    text: 'text-danger',
    border: 'border-danger/30',
  },
  
  // Transaction statuses
  paid: {
    dot: 'bg-success',
    bg: 'bg-success-bg',
    text: 'text-success',
    border: 'border-success/30',
  },
  overdue: {
    dot: 'bg-danger',
    bg: 'bg-danger-bg',
    text: 'text-danger',
    border: 'border-danger/30',
  },
  failed: {
    dot: 'bg-warning',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  
  // Generic
  success: {
    dot: 'bg-success',
    bg: 'bg-success-bg',
    text: 'text-success',
    border: 'border-success/30',
  },
  info: {
    dot: 'bg-info',
    bg: 'bg-info-bg',
    text: 'text-info',
    border: 'border-info/30',
  },
  warning: {
    dot: 'bg-warning',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  error: {
    dot: 'bg-danger',
    bg: 'bg-danger-bg',
    text: 'text-danger',
    border: 'border-danger/30',
  },
};

const STATUS_LABELS: Record<StatusType, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  ACTIVE: 'Active',
  TRIAL: 'Trial',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled',
  online: 'Online',
  offline: 'Offline',
  degraded: 'Degraded',
  healthy: 'Healthy',
  warn: 'Warning',
  critical: 'Critical',
  paid: 'Paid',
  overdue: 'Overdue',
  failed: 'Failed',
  success: 'Success',
  info: 'Info',
  warning: 'Warning',
  error: 'Error',
};

const SIZES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const DOT_SIZES = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.info;
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        config.bg,
        config.text,
        config.border,
        SIZES[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full',
            config.dot,
            DOT_SIZES[size],
            status === 'online' && 'animate-pulse',
            status === 'ACTIVE' && 'animate-pulse',
            status === 'healthy' && 'animate-pulse',
            status === 'active' && 'animate-pulse'
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}
