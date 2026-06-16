import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock system monitor data
    const data = {
      metrics: [
        {
          label: 'Total Services',
          value: '12',
          sub: 'All operational',
          status: 'healthy',
        },
        {
          label: 'Uptime',
          value: '99.98%',
          sub: '30 day average',
          status: 'healthy',
          delta: '+0.02%',
          deltaDir: 'up',
        },
        {
          label: 'Error Rate',
          value: '0.04%',
          sub: 'Last 24 hours',
          status: 'healthy',
          delta: '-0.01%',
          deltaDir: 'down',
        },
        {
          label: 'Response Time',
          value: '142ms',
          sub: 'Average latency',
          status: 'warn',
          delta: '+12ms',
          deltaDir: 'up',
        },
        {
          label: 'Active Users',
          value: '1,248',
          sub: 'Current sessions',
          status: 'healthy',
          delta: '+18',
          deltaDir: 'up',
        },
        {
          label: 'Queue Depth',
          value: '3',
          sub: 'Pending tasks',
          status: 'healthy',
          delta: '-2',
          deltaDir: 'down',
        },
      ],
      services: [
        {
          name: 'API Gateway',
          status: 'online',
          uptime: '99.99%',
          latency: '45ms',
          lastChecked: '2 min ago',
          region: 'us-east-1',
        },
        {
          name: 'Authentication Service',
          status: 'online',
          uptime: '99.97%',
          latency: '67ms',
          lastChecked: '1 min ago',
          region: 'us-east-1',
        },
        {
          name: 'Database',
          status: 'online',
          uptime: '99.99%',
          latency: '12ms',
          lastChecked: '3 min ago',
          region: 'us-east-1',
        },
        {
          name: 'Redis Cache',
          status: 'online',
          uptime: '99.95%',
          latency: '8ms',
          lastChecked: '2 min ago',
          region: 'us-east-1',
        },
        {
          name: 'File Storage',
          status: 'degraded',
          uptime: '99.87%',
          latency: '234ms',
          lastChecked: '1 min ago',
          region: 'us-east-1',
        },
        {
          name: 'Email Service',
          status: 'online',
          uptime: '99.92%',
          latency: '156ms',
          lastChecked: '2 min ago',
          region: 'us-west-2',
        },
        {
          name: 'Notification Service',
          status: 'online',
          uptime: '99.94%',
          latency: '89ms',
          lastChecked: '1 min ago',
          region: 'us-west-2',
        },
        {
          name: 'Analytics Engine',
          status: 'degraded',
          uptime: '99.78%',
          latency: '312ms',
          lastChecked: '3 min ago',
          region: 'eu-west-1',
        },
      ],
      errors: [
        {
          id: 'err-1',
          timestamp: '2 min ago',
          code: 'ERR_500',
          message: 'Internal server error on /api/tenants',
          count: 3,
          severity: 'error',
        },
        {
          id: 'err-2',
          timestamp: '5 min ago',
          code: 'ERR_429',
          message: 'Rate limit exceeded for user: john.doe',
          count: 12,
          severity: 'warn',
        },
        {
          id: 'err-3',
          timestamp: '10 min ago',
          code: 'ERR_504',
          message: 'Gateway timeout on /api/billing/summary',
          count: 2,
          severity: 'error',
        },
        {
          id: 'err-4',
          timestamp: '15 min ago',
          code: 'ERR_404',
          message: 'Tenant not found: tenant-xyz',
          count: 5,
          severity: 'info',
        },
        {
          id: 'err-5',
          timestamp: '20 min ago',
          code: 'ERR_400',
          message: 'Invalid request body for /api/feature-flags',
          count: 8,
          severity: 'warn',
        },
      ],
      wsSnap: {
        total: 1248,
        authenticated: 986,
        anonymous: 262,
        peakToday: 1342,
        messagesPerSec: 43,
      },
      uptimeBars: [
        { day: 'Mon', pct: 99.98 },
        { day: 'Tue', pct: 99.95 },
        { day: 'Wed', pct: 99.99 },
        { day: 'Thu', pct: 99.97 },
        { day: 'Fri', pct: 99.92 },
        { day: 'Sat', pct: 99.96 },
        { day: 'Sun', pct: 99.94 },
      ],
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('System monitor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
