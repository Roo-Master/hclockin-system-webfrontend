import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock user data - In production, this would come from a database
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'admin@citycare.com',
    password: 'password123',
    role: 'super_admin',
    tenantId: null,
    avatarInitials: 'JD',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'hospital@citycare.com',
    password: 'password123',
    role: 'hospital_admin',
    tenantId: 'tenant-1',
    avatarInitials: 'JS',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Generate mock token (in production, use JWT)
    const token = `mock-token-${Date.now()}-${user.id}`;
    const refreshToken = `mock-refresh-${Date.now()}-${user.id}`;

    // Set cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
