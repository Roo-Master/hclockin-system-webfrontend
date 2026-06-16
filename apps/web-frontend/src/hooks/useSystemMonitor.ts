import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  status: 'healthy' | 'warn' | 'critical';
  delta?: string;
  deltaDir?: 'up' | 'down' | 'neutral';
}

interface ServiceRow {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
  latency: string;
  lastChecked: string;
  region: string;
}

interface ErrorEvent {
  id: string;
  timestamp: string;
  code: string;
  message: string;
  count: number;
  severity: 'error' | 'warn' | 'info';
}

interface WsSnapshot {
  total: number;
  authenticated: number;
  anonymous: number;
  peakToday: number;
  messagesPerSec: number;
}

interface UptimeBar {
  day: string;
  pct: number;
}

interface SystemMonitorData {
  metrics: MetricCard[];
  services: ServiceRow[];
  errors: ErrorEvent[];
  wsSnap: WsSnapshot;
  uptimeBars: UptimeBar[];
}

export function useSystemMonitor(refreshInterval: number = 3000) {
  const [data, setData] = useState<SystemMonitorData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { loading, error, execute } = useApi();

  const fetchData = useCallback(async () => {
    const result = await execute(async () => {
      const response = await fetch('/api/super-admin/system-monitor', { cache: 'no-store' });
      const responseData = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: responseData.message || 'Failed to load system monitor data',
          status: response.status,
          success: false,
        };
      }

      return {
        data: responseData,
        status: response.status,
        success: true,
      };
    });

    if (result.data) {
      setData(result.data);
      setLastUpdated(new Date().toLocaleTimeString('en-KE', { hour12: false }));
    }

    return result;
  }, [execute]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchData,
  };
}
