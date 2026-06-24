import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function extractToken(request: NextRequest): string | null {
  // 1. Standard Authorization header
  const authHeader =
    request.headers.get('Authorization') ||
    request.headers.get('authorization');
  if (authHeader) return authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`;

  // 2. JWT cookies (real auth)
  const jwtCookie =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('auth_token')?.value;
  if (jwtCookie) return `Bearer ${jwtCookie}`;

  // 3. x-access-token header
  const xAccessToken = request.headers.get('x-access-token');
  if (xAccessToken) return `Bearer ${xAccessToken}`;

  // 4. Dev/super-admin role cookie (e.g. token=super_admin)
  const roleCookie = request.cookies.get('token')?.value;
  if (roleCookie === 'super_admin') return `Bearer dev_super_admin`;

  return null;
}

export async function GET(request: NextRequest) {
  const token = extractToken(request);

  if (!token) {
    console.warn('[super-admin/stats] Unauthorized — no token found');
    console.warn('  cookies:', request.cookies.getAll());
    return NextResponse.json(
      { error: 'Unauthorized — no token provided' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${API_BASE}/super-admin/stats`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[super-admin/stats] Backend error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[super-admin/stats] Failed to reach backend:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 503 }
    );
  }
}