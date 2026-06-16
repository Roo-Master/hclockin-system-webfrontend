import { NextRequest, NextResponse } from 'next/server';

// Mock data - In production, this would come from a database
const MOCK_TENANTS: Record<string, any> = {
  'tenant-1': {
    id: 'tenant-1',
    name: 'Kenyatta National Hospital',
    slug: 'knh',
    status: 'ACTIVE',
    plan: 'PROFESSIONAL',
    staffCount: 1200,
    adminEmail: 'admin@knh.go.ke',
    mrr: 12000,
    createdAt: '2024-01-15T10:00:00Z',
    country: 'Kenya',
    lastActive: '2024-12-15T08:30:00Z',
    contactName: 'Dr. John Mwangi',
    notes: 'Main teaching hospital',
  },
  'tenant-2': {
    id: 'tenant-2',
    name: 'Aga Khan University Hospital',
    slug: 'akuh',
    status: 'ACTIVE',
    plan: 'ENTERPRISE',
    staffCount: 800,
    adminEmail: 'admin@akuh.edu',
    mrr: 24000,
    createdAt: '2024-02-01T10:00:00Z',
    country: 'Kenya',
    lastActive: '2024-12-15T09:15:00Z',
    contactName: 'Dr. Sarah Ochieng',
    notes: 'Private teaching hospital',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tenant = MOCK_TENANTS[id];

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Get tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!MOCK_TENANTS[id]) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Update tenant
    const updatedTenant = {
      ...MOCK_TENANTS[id],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    MOCK_TENANTS[id] = updatedTenant;

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error('Update tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!MOCK_TENANTS[id]) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    delete MOCK_TENANTS[id];

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
