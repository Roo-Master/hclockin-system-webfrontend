import { BaseEntity } from './common';

/**
 * Service status
 */
export type ServiceStatus = 'online' | 'degraded' | 'offline' | 'maintenance';

/**
 * Metric status
 */
export type MetricStatus = 'healthy' | 'warn' | 'critical';

/**
 * Error severity
 */
export type ErrorSeverity = 'error' | 'warn' | 'info' | 'debug';

/**
 * Metric card
 */
export interface MetricCard {
  label: string;
  value: string;
  sub: string;
  status: MetricStatus;
  delta?: string;
  deltaDir?: 'up' | 'down' | 'neutral';
  icon?: string;
}

/**
 * Service row
 */
export interface ServiceRow {
  name: string;
  status: ServiceStatus;
  uptime: string;
  latency: string;
  lastChecked: string;
  region: string;
  description?: string;
}

/**
 * Error event
 */
export interface ErrorEvent {
  id: string;
  timestamp: string;
  code: string;
  message: string;
  count: number;
  severity: ErrorSeverity;
  source?: string;
  stack?: string;
}

/**
 * WebSocket snapshot
 */
export interface WsSnapshot {
  total: number;
  authenticated: number;
  anonymous: number;
  peakToday: number;
  messagesPerSec: number;
  bytesPerSec: number;
  connections: WsConnection[];
}

/**
 * WebSocket connection
 */
export interface WsConnection {
  id: string;
  userId: string | null;
  authenticated: boolean;
  connectedAt: string;
  lastActivity: string;
  ip: string;
  userAgent: string;
}

/**
 * Uptime bar
 */
export interface UptimeBar {
  day: string;
  pct: number;
  status?: MetricStatus;
}

/**
 * System monitor data
 */
export interface SystemMonitorData {
  metrics: MetricCard[];
  services: ServiceRow[];
  errors: ErrorEvent[];
  wsSnap: WsSnapshot;
  uptimeBars: UptimeBar[];
  timestamp: string;
}

/**
 * System health
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  message: string;
  details: {
    service: string;
    status: ServiceStatus;
    message: string;
  }[];
}

/**
 * System alert
 */
export interface SystemAlert {
  id: string;
  severity: ErrorSeverity;
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

/**
 * System log
 */
export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
  responseTime: number;
  errorRate: number;
  requestsPerSecond: number;
}
