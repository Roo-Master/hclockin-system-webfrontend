import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    let token = request.headers.get('Authorization');
    
    if (!token) {
      const cookieToken = request.cookies.get('accessToken')?.value;
      if (cookieToken) {
        token = `Bearer ${cookieToken}`;
      }
    }
    
    if (!token) {
      const headerToken = request.headers.get('x-access-token');
      if (headerToken) {
        token = `Bearer ${headerToken}`;
      }
    }

    if (!token) {
      console.log('[Super Admin Admins] No token found in request');
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const tenantId = searchParams.get('tenantId');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    // Build query string
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (role && role !== 'all') queryParams.append('role', role);
    if (status && status !== 'all') queryParams.append('status', status);
    if (tenantId) queryParams.append('tenantId', tenantId);
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/super-admin/admins${queryString ? `?${queryString}` : ''}`;

    console.log('[Super Admin Admins] Fetching from:', url);

    // Forward the request to the backend API
    const response = await fetch(url, {
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[Super Admin Admins] Backend error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.message || `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Super Admin Admins] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API. Please check if the server is running.' },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token
    let token = request.headers.get('Authorization');
    
    if (!token) {
      const cookieToken = request.cookies.get('accessToken')?.value;
      if (cookieToken) {
        token = `Bearer ${cookieToken}`;
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, role, tenantId, name } = body;

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'TenantId is required' },
        { status: 400 }
      );
    }

    console.log('[Super Admin Admins] Creating admin:', { email, role, tenantId, name });

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/super-admin/admins`, {
      method: 'POST',
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role,
        tenantId,
        name: name || email.split('@')[0],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[Super Admin Admins] Backend error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.message || `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[Super Admin Admins] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API. Please check if the server is running.' },
      { status: 503 }
    );
  }
}