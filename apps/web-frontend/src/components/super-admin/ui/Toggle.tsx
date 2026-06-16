'use client';

import { cn } from '@/lib/utils';

export interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const SIZES = {
  sm: {
    track: 'h-4 w-7',
    thumb: 'h-3 w-3',
    translate: 'translate-x-3.5',
  },
  md: {
    track: 'h-5 w-9',
    thumb: 'h-3.5 w-3.5',
    translate: 'translate-x-4.5',
  },
  lg: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5.5',
  },
};

export function Toggle({
  enabled,
  onChange,
  size = 'md',
  disabled = false,
  className,
}: ToggleProps) {
  const sizes = SIZES[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-info/50 focus:ring-offset-2',
        sizes.track,
        enabled ? 'bg-info' : 'bg-border',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full bg-white shadow transform transition-transform duration-200',
          sizes.thumb,
          enabled ? sizes.translate : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
