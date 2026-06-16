import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const STATUS_COLORS = {
  online: 'bg-success',
  offline: 'bg-text-tertiary',
  away: 'bg-warning',
  busy: 'bg-danger',
};

const STATUS_SIZES = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
};

export function Avatar({
  name,
  src,
  size = 'md',
  className,
  onClick,
  status,
}: AvatarProps) {
  const initials = getInitials(name);
  const colors = [
    'bg-info-bg text-info',
    'bg-success-bg text-success',
    'bg-warning-bg text-warning',
    'bg-danger-bg text-danger',
    'bg-[#DBEAFE] text-[#2563EB]',
    'bg-[#DCFCE7] text-[#16A34A]',
    'bg-[#FFEDD5] text-[#EA580C]',
    'bg-[#FEE2E2] text-[#DC2626]',
    'bg-[#E5E7EB] text-[#6B7280]',
    'bg-[#DBEAFE] text-[#2563EB]',
  ];
  
  // Deterministic color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZES[size],
        src ? '' : colorClass,
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-surface',
            STATUS_COLORS[status],
            STATUS_SIZES[size]
          )}
        />
      )}
    </div>
  );
}
