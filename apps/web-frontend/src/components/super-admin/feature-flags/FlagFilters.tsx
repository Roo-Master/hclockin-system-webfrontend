'use client';

import { Input, Select } from '@/components/common';
import { Button } from '@/components/common';
import { FlagCategory } from '@/types/feature-flags';

interface FlagFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: FlagCategory | 'all';
  onCategoryChange: (value: FlagCategory | 'all') => void;
  status: 'all' | 'on' | 'off';
  onStatusChange: (value: 'all' | 'on' | 'off') => void;
  onReset: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'auth', label: 'Auth' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'experimental', label: 'Experimental' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'on', label: 'Enabled' },
  { value: 'off', label: 'Disabled' },
];

export function FlagFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  onReset,
}: FlagFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Input
          placeholder="Search by name or key..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<span className="text-text-tertiary">🔍</span>}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as FlagCategory | 'all')}
          options={CATEGORY_OPTIONS}
          className="min-w-[140px]"
        />
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'all' | 'on' | 'off')}
          options={STATUS_OPTIONS}
          className="min-w-[120px]"
        />
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
