'use client';

import { useState } from 'react';
import { Button } from '@/components/common';
import { FeatureFlag } from '@/types/feature-flags';

interface ConfirmModalProps {
  flag: FeatureFlag;
  action: 'enable' | 'disable';
  tenantId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  tenants?: { id: string; name: string; shortCode: string }[];
}

export function ConfirmModal({
  flag,
  action,
  tenantId,
  onConfirm,
  onCancel,
  tenants = [],
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const tenant = tenantId ? tenants.find((t) => t.id === tenantId) : null;
  const isRisky = !flag.stable;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Failed to confirm action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-xl p-6">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0',
              action === 'enable'
                ? 'bg-info-bg border border-info/30'
                : 'bg-page border border-border'
            )}
          >
            {action === 'enable' ? '✓' : '○'}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              {action === 'enable' ? 'Enable' : 'Disable'} flag?
            </h2>
            <p className="text-[11px] font-medium text-text-secondary mt-0.5">
              {flag.key}
            </p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mt-4">
          {tenant
            ? `This will ${action} "${flag.name}" for ${tenant.shortCode} only.`
            : `This will ${action} "${flag.name}" globally across all tenants.`
          }
        </p>

        {isRisky && (
          <div className="flex items-start gap-2 bg-danger-bg border border-danger/30 rounded-lg px-3 py-2.5 mt-4">
            <span className="text-danger text-xs mt-px">⚠</span>
            <p className="text-[11px] text-danger leading-relaxed">
              This is an experimental flag. Changes may cause instability. Proceed with caution.
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <Button variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={action === 'enable' ? 'primary' : 'secondary'}
            fullWidth
            loading={loading}
            onClick={handleConfirm}
          >
            {action === 'enable' ? 'Enable' : 'Disable'}
          </Button>
        </div>
      </div>
    </div>
  );
}
