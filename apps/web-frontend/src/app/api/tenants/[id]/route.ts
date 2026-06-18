import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL - adjust based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const token = request.headers.get('Authorization') || request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/super-admin/tenants/${id}`, {
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Tenant API error: ${response.status}` },
        { status: response.status }
      );
    }

    const tenant = await response.json();
    return NextResponse.json(tenant);
  } catch (error) {
    console.error('[Super Admin] Get tenant error:', error);
    
    // Return a placeholder response for development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        id: params.id,
        name: 'Loading tenant...',
        slug: 'loading',
        status: 'PENDING',
        plan: 'FREE',
        staffCount: 0,
        adminEmail: 'loading@placeholder.com',
        mrr: 0,
        createdAt: new Date().toISOString(),
        country: 'Loading...',
        lastActive: new Date().toISOString(),
        contactName: 'Loading...',
        notes: 'Loading tenant details. Backend API may be unavailable.',
        _placeholder: true,
      });
    }

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
    const token = request.headers.get('Authorization') || request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/super-admin/tenants/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Tenant update error: ${response.status}` },
        { status: response.status }
      );
    }

    const updatedTenant = await response.json();
    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error('[Super Admin] Update tenant error:', error);
    
    // Return success placeholder for development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        id: params.id,
        ...(await request.json()),
        updatedAt: new Date().toISOString(),
        _placeholder: true,
        _message: 'Update would be processed by backend API',
      });
    }

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
    const token = request.headers.get('Authorization') || request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/super-admin/tenants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Tenant delete error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Super Admin] Delete tenant error:', error);
    
    // Return success placeholder for development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        _placeholder: true,
        _message: 'Delete would be processed by backend API',
        deletedId: params.id 
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}