import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
  try {
    // 🔥 FIX: Check multiple sources for token
    let token = request.headers.get('Authorization');
    
    // If not in header, try cookies (accessToken)
    if (!token) {
      const cookieToken = request.cookies.get('accessToken')?.value;
      if (cookieToken) {
        token = `Bearer ${cookieToken}`;
      }
    }
    
    // 🔥 NEW: Check for auth_token in cookies (frontend might use this)
    if (!token) {
      const authToken = request.cookies.get('auth_token')?.value;
      if (authToken) {
        token = `Bearer ${authToken}`;
      }
    }
    
    // If still no token, try the x-access-token header
    if (!token) {
      const headerToken = request.headers.get('x-access-token');
      if (headerToken) {
        token = `Bearer ${headerToken}`;
      }
    }

    // 🔥 NEW: Check Authorization header for 'auth_token' format
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        token = authHeader;
      }
    }

    if (!token) {
      console.log('[Super Admin Stats] No token found in request');
      console.log('Headers:', Object.fromEntries(request.headers));
      console.log('Cookies:', request.cookies.getAll());
      
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    console.log('[Super Admin Stats] Token found, fetching from backend...');

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/super-admin/stats`, {
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[Super Admin Stats] Backend error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.message || `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Super Admin Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 503 }
    );
  }
}