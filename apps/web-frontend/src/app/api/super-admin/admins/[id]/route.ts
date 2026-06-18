import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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

    console.log('[Super Admin Admin] Fetching admin:', id);

    const response = await fetch(`${API_BASE_URL}/super-admin/admins/${id}`, {
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Super Admin Admin] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 503 }
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

    console.log('[Super Admin Admin] Updating admin:', id, body);

    const response = await fetch(`${API_BASE_URL}/super-admin/admins/${id}`, {
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
        { error: errorData.message || `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Super Admin Admin] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 503 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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

    console.log('[Super Admin Admin] Deleting admin:', id);

    const response = await fetch(`${API_BASE_URL}/super-admin/admins/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Super Admin Admin] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 503 }
    );
  }
}