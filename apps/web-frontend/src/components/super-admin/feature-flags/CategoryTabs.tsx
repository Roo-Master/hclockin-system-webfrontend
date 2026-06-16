'use client';

import { cn } from '@/lib/utils';
import { FlagCategory } from '@/types/feature-flags';

interface CategoryTabsProps {
  flags: any[];
  selectedCategory: FlagCategory | 'all';
  onCategoryChange: (category: FlagCategory | 'all') => void;
}

const CATEGORY_META: Record<FlagCategory, { label: string; icon: string }> = {
  attendance: { label: 'Attendance', icon: '⏱' },
  notifications: { label: 'Notifications', icon: '🔔' },
  auth: { label: 'Auth', icon: '🔒' },
  reporting: { label: 'Reporting', icon: '📊' },
  experimental: { label: 'Experimental', icon: '⚗️' },
};

export function CategoryTabs({
  flags,
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const categories: Array<FlagCategory | 'all'> = [
    'all',
    'attendance',
    'notifications',
    'auth',
    'reporting',
    'experimental',
  ];

  const getCount = (category: FlagCategory | 'all') => {
    if (category === 'all') return flags.length;
    return flags.filter((f) => f.category === category).length;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const meta = cat === 'all' ? null : CATEGORY_META[cat];
        const count = getCount(cat);
        const isActive = selectedCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
              isActive
                ? 'border-info bg-info-bg text-info'
                : 'border-border bg-surface text-text-secondary hover:text-text-primary hover:border-text-secondary'
            )}
          >
            {meta && <span>{meta.icon}</span>}
            {cat === 'all' ? 'All' : meta?.label}
            <span
              className={cn(
                'rounded px-1.5 py-px text-[10px] font-medium',
                isActive
                  ? 'bg-info/10 text-info'
                  : 'bg-page text-text-tertiary'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
