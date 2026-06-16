'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useFeatureFlags } from '@/lib/hooks/useFeatureFlags';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  strategy: string;
  globalEnabled: boolean;
  percentage?: number;
  tenantOverrides: Array<{ tenantId: string; enabled: boolean }>;
  stable: boolean;
}

interface FeatureFlagContextType {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  isEnabled: (key: string, tenantId?: string) => boolean;
  getFlag: (key: string) => FeatureFlag | undefined;
  refresh: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

interface FeatureFlagProviderProps {
  children: ReactNode;
  tenantId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function FeatureFlagProvider({ 
  children, 
  tenantId,
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute
}: FeatureFlagProviderProps) {
  const { flags, loading, error, refresh: refreshFlags } = useFeatureFlags();
  const [isLoading, setIsLoading] = useState(true);
  const [flagCache, setFlagCache] = useState<Map<string, boolean>>(new Map());

  // Load flags on mount
  useEffect(() => {
    const loadFlags = async () => {
      setIsLoading(true);
      await refreshFlags();
      setIsLoading(false);
    };
    loadFlags();
  }, [refreshFlags]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshFlags();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshFlags]);

  // Update cache when flags change
  useEffect(() => {
    const newCache = new Map<string, boolean>();
    flags.forEach(flag => {
      if (flag.strategy === 'global') {
        newCache.set(flag.key, flag.globalEnabled);
      } else if (flag.strategy === 'per_tenant' && tenantId) {
        const override = flag.tenantOverrides.find(o => o.tenantId === tenantId);
        newCache.set(flag.key, override ? override.enabled : flag.globalEnabled);
      } else if (flag.strategy === 'percentage') {
        // Implement percentage-based rollout
        const percentage = flag.percentage || 0;
        const hash = hashString(flag.key + (tenantId || ''));
        newCache.set(flag.key, (hash % 100) < percentage);
      } else {
        newCache.set(flag.key, flag.globalEnabled);
      }
    });
    setFlagCache(newCache);
  }, [flags, tenantId]);

  const isEnabled = useCallback(
    (key: string, tenantOverrideId?: string): boolean => {
      // Check if flag exists in cache
      if (flagCache.has(key)) {
        return flagCache.get(key) || false;
      }

      // Fallback: find flag and evaluate manually
      const flag = flags.find(f => f.key === key);
      if (!flag) return false;

      if (flag.strategy === 'global') {
        return flag.globalEnabled;
      }

      if (flag.strategy === 'per_tenant') {
        const targetTenantId = tenantOverrideId || tenantId;
        if (targetTenantId) {
          const override = flag.tenantOverrides.find(o => o.tenantId === targetTenantId);
          return override ? override.enabled : flag.globalEnabled;
        }
        return flag.globalEnabled;
      }

      if (flag.strategy === 'percentage') {
        const percentage = flag.percentage || 0;
        const hash = hashString(flag.key + (tenantOverrideId || tenantId || ''));
        return (hash % 100) < percentage;
      }

      return flag.globalEnabled;
    },
    [flags, flagCache, tenantId]
  );

  const getFlag = useCallback(
    (key: string): FeatureFlag | undefined => {
      return flags.find(f => f.key === key);
    },
    [flags]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await refreshFlags();
    setIsLoading(false);
  }, [refreshFlags]);

  const value: FeatureFlagContextType = {
    flags,
    isLoading,
    error,
    isEnabled,
    getFlag,
    refresh,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// ─── Helper: Simple hash function for percentage-based rollouts ────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ─── Hook to use feature flags ─────────────────────────────────────────────

export function useFeatureFlagContext() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }
  return context;
}

// ─── Feature Flag Component ─────────────────────────────────────────────────

interface FeatureFlaggedProps {
  flag: string;
  tenantId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureFlagged({ flag, tenantId, children, fallback = null }: FeatureFlaggedProps) {
  const { isEnabled } = useFeatureFlagContext();
  const enabled = isEnabled(flag, tenantId);
  
  return enabled ? <>{children}</> : <>{fallback}</>;
}
