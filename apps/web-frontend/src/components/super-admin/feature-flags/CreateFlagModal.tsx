'use client';

import { useState } from 'react';
import { Button, Input, Select } from '@/components/common';
import { FlagCategory, RolloutStrategy } from '@/types/feature-flags';

interface CreateFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (flag: any) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'auth', label: 'Auth' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'experimental', label: 'Experimental' },
];

const STRATEGY_OPTIONS = [
  { value: 'global', label: 'Global' },
  { value: 'per_tenant', label: 'Per-tenant' },
  { value: 'percentage', label: 'Percentage' },
];

export function CreateFlagModal({
  isOpen,
  onClose,
  onCreate,
}: CreateFlagModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    category: 'attendance' as FlagCategory,
    strategy: 'global' as RolloutStrategy,
    globalEnabled: false,
    percentage: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z.]+$/.test(formData.key)) {
      newErrors.key = 'Key must use lowercase letters and dots';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.strategy === 'percentage' && (formData.percentage < 0 || formData.percentage > 100)) {
      newErrors.percentage = 'Percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onCreate(formData);
      onClose();
      setFormData({
        key: '',
        name: '',
        description: '',
        category: 'attendance',
        strategy: 'global',
        globalEnabled: false,
        percentage: 50,
      });
    } catch (error) {
      console.error('Failed to create flag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Create Feature Flag</h2>
            <p className="text-sm text-text-secondary">Add a new feature flag</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Key"
            placeholder="e.g., feature.name"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            error={errors.key}
          />

          <Input
            label="Name"
            placeholder="Feature flag name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />

          <Input
            label="Description"
            placeholder="Describe the feature"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as FlagCategory })}
            options={CATEGORY_OPTIONS}
          />

          <Select
            label="Strategy"
            value={formData.strategy}
            onChange={(e) => setFormData({ ...formData, strategy: e.target.value as RolloutStrategy })}
            options={STRATEGY_OPTIONS}
          />

          {formData.strategy === 'percentage' && (
            <Input
              label="Rollout Percentage"
              type="number"
              min={0}
              max={100}
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) || 0 })}
              error={errors.percentage}
            />
          )}

          {formData.strategy === 'global' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="globalEnabled"
                checked={formData.globalEnabled}
                onChange={(e) => setFormData({ ...formData, globalEnabled: e.target.checked })}
                className="rounded border-border text-info focus:ring-info"
              />
              <label htmlFor="globalEnabled" className="text-sm text-text-primary">
                Enable globally by default
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onClick={handleSubmit}
          >
            Create Flag
          </Button>
        </div>
      </div>
    </div>
  );
}
