import { NextRequest, NextResponse } from 'next/server';

// Mock data
const MOCK_TENANTS = [
  {
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
  {
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
  {
    id: 'tenant-3',
    name: 'Nairobi Hospital',
    slug: 'nh',
    status: 'TRIAL',
    plan: 'STARTER',
    staffCount: 400,
    adminEmail: 'admin@nh.co.ke',
    mrr: 0,
    createdAt: '2024-11-01T10:00:00Z',
    country: 'Kenya',
    lastActive: '2024-12-14T14:00:00Z',
    contactName: 'Mr. Peter Kimani',
    notes: 'Trial period until December 31',
    trialEndsAt: '2024-12-31T23:59:59Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let tenants = [...MOCK_TENANTS];

    // Apply filters
    if (search) {
      tenants = tenants.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.slug.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status && status !== 'ALL') {
      tenants = tenants.filter((t) => t.status === status);
    }

    if (plan && plan !== 'ALL') {
      tenants = tenants.filter((t) => t.plan === plan);
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTenants = tenants.slice(start, end);

    return NextResponse.json({
      tenants: paginatedTenants,
      total: tenants.length,
      page,
      limit,
      totalPages: Math.ceil(tenants.length / limit),
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, subdomain, adminEmail, contactName, plan, country, licenseKey, billingCycle } = body;

    // Validate required fields
    if (!name || !slug || !adminEmail || !contactName || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new tenant
    const newTenant = {
      id: `tenant-${Date.now()}`,
      name,
      slug,
      status: 'ACTIVE',
      plan,
      staffCount: 0,
      adminEmail,
      mrr: 0,
      createdAt: new Date().toISOString(),
      country: country || 'Kenya',
      lastActive: new Date().toISOString(),
      contactName,
      notes: null,
    };

    // In production, save to database
    return NextResponse.json(newTenant, { status: 201 });
  } catch (error) {
    console.error('Create tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
