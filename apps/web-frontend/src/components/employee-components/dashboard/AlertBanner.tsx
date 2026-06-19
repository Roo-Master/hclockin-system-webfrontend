'use client';

import { useState } from 'react';

interface AlertBannerProps {
  message: string;
}

export default function AlertBanner({ message }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-warning-bg border border-warning/30 rounded-card px-4 py-3 text-sm text-primary">
      <span className="text-warning text-base">⚠</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="text-warning hover:text-primary transition-colors text-base"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}