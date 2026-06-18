import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, tenantId } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // In production, check if user exists and create in database
    // For now, just return mock user
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: role || 'hospital_admin',
      tenantId: tenantId || null,
      avatarInitials: name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };

    const token = `mock-token-${Date.now()}-${newUser.id}`;
    const refreshToken = `mock-refresh-${Date.now()}-${newUser.id}`;

    // Set cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      user: newUser,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
