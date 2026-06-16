import { NextRequest, NextResponse } from 'next/server';

// Mock data
const MOCK_ADMINS = [
  {
    id: 'admin-1',
    name: 'John Doe',
    email: 'john.doe@citycare.com',
    role: 'super_admin',
    status: 'active',
    tenantId: null,
    lastLogin: '2024-12-15T10:00:00Z',
    joinedAt: '2024-01-01T10:00:00Z',
    avatarInitials: 'JD',
  },
  {
    id: 'admin-2',
    name: 'Jane Smith',
    email: 'jane.smith@knh.go.ke',
    role: 'hospital_admin',
    status: 'active',
    tenantId: 'tenant-1',
    lastLogin: '2024-12-14T15:30:00Z',
    joinedAt: '2024-03-15T10:00:00Z',
    avatarInitials: 'JS',
  },
  {
    id: 'admin-3',
    name: 'Peter Kimani',
    email: 'peter.kimani@akuh.edu',
    role: 'hr_manager',
    status: 'pending',
    tenantId: 'tenant-2',
    lastLogin: '2024-12-10T09:00:00Z',
    joinedAt: '2024-06-01T10:00:00Z',
    avatarInitials: 'PK',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const tenantId = searchParams.get('tenantId');

    let admins = [...MOCK_ADMINS];

    // Apply filters
    if (search) {
      admins = admins.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role && role !== 'all') {
      admins = admins.filter((a) => a.role === role);
    }

    if (status && status !== 'all') {
      admins = admins.filter((a) => a.status === status);
    }

    if (tenantId) {
      admins = admins.filter((a) => a.tenantId === tenantId);
    }

    return NextResponse.json({
      admins,
      total: admins.length,
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, tenantId } = body;

    if (!email || !role || !tenantId) {
      return NextResponse.json(
        { error: 'Email, role, and tenantId are required' },
        { status: 400 }
      );
    }

    // In production, create admin in database and send invitation email
    const newAdmin = {
      id: `admin-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      status: 'pending',
      tenantId,
      lastLogin: 'Never',
      joinedAt: new Date().toISOString(),
      avatarInitials: email
        .split('@')[0]
        .split('.')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
