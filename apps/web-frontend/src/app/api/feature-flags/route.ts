import { NextRequest, NextResponse } from 'next/server';

// Mock feature flags
const MOCK_FLAGS = [
  {
    id: 'flag-1',
    key: 'attendance.geofence_check',
    name: 'Geofence Clock-in Check',
    description: 'Enforces GPS boundary validation when staff clock in.',
    category: 'attendance',
    strategy: 'per_tenant',
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: 'tenant-1', enabled: true },
      { tenantId: 'tenant-2', enabled: true },
    ],
    lastModified: '2 hours ago',
    modifiedBy: 'admin@citycare.com',
    stable: true,
  },
  {
    id: 'flag-2',
    key: 'attendance.late_window_grace',
    name: 'Late Submission Grace Window',
    description: 'Allows clock-in submissions up to 15 minutes after shift window.',
    category: 'attendance',
    strategy: 'global',
    globalEnabled: true,
    tenantOverrides: [],
    lastModified: 'Yesterday',
    modifiedBy: 'admin@citycare.com',
    stable: true,
  },
  {
    id: 'flag-3',
    key: 'notifications.digest_mode',
    name: 'Notification Digest Mode',
    description: 'Batches non-urgent notifications into hourly digests.',
    category: 'notifications',
    strategy: 'per_tenant',
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: 'tenant-1', enabled: true },
      { tenantId: 'tenant-2', enabled: false },
    ],
    lastModified: '3 days ago',
    modifiedBy: 'admin@citycare.com',
    stable: true,
  },
  {
    id: 'flag-4',
    key: 'auth.mfa_enforcement',
    name: 'MFA Enforcement',
    description: 'Requires all admin accounts to complete multi-factor authentication.',
    category: 'auth',
    strategy: 'per_tenant',
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: 'tenant-1', enabled: true },
      { tenantId: 'tenant-2', enabled: true },
    ],
    lastModified: '5 days ago',
    modifiedBy: 'admin@citycare.com',
    stable: true,
  },
  {
    id: 'flag-5',
    key: 'reporting.realtime_dashboard',
    name: 'Real-time Analytics Dashboard',
    description: 'Replaces static dashboard with live WebSocket-driven metrics.',
    category: 'reporting',
    strategy: 'per_tenant',
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: 'tenant-1', enabled: true },
      { tenantId: 'tenant-2', enabled: false },
    ],
    lastModified: '1 day ago',
    modifiedBy: 'admin@citycare.com',
    stable: false,
  },
  {
    id: 'flag-6',
    key: 'experimental.ai_shift_scheduler',
    name: 'AI Shift Scheduler',
    description: 'Uses AI to auto-suggest optimal shift rosters.',
    category: 'experimental',
    strategy: 'per_tenant',
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: 'tenant-2', enabled: true },
    ],
    lastModified: '6 hours ago',
    modifiedBy: 'admin@citycare.com',
    stable: false,
  },
  {
    id: 'flag-7',
    key: 'reporting.pdf_export',
    name: 'PDF Report Export',
    description: 'Enables one-click PDF export for reports.',
    category: 'reporting',
    strategy: 'percentage',
    globalEnabled: true,
    percentage: 75,
    tenantOverrides: [],
    lastModified: '4 days ago',
    modifiedBy: 'admin@citycare.com',
    stable: true,
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      flags: MOCK_FLAGS,
      total: MOCK_FLAGS.length,
    });
  } catch (error) {
    console.error('Get feature flags error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, name, description, category, strategy, globalEnabled, percentage } = body;

    if (!key || !name || !category || !strategy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newFlag = {
      id: `flag-${Date.now()}`,
      key,
      name,
      description: description || '',
      category,
      strategy,
      globalEnabled: globalEnabled || false,
      percentage: percentage || undefined,
      tenantOverrides: [],
      lastModified: 'Just now',
      modifiedBy: 'admin@citycare.com',
      stable: strategy !== 'experimental',
    };

    MOCK_FLAGS.push(newFlag);

    return NextResponse.json(newFlag, { status: 201 });
  } catch (error) {
    console.error('Create feature flag error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
