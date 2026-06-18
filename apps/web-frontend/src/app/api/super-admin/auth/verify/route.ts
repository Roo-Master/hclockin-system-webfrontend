import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock users - In production, this would come from a database
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'admin@citycare.com',
    role: 'super_admin',
    tenantId: null,
    avatarInitials: 'JD',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'hospital@citycare.com',
    role: 'hospital_admin',
    tenantId: 'tenant-1',
    avatarInitials: 'JS',
  },
];

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('auth_token')?.value;
    const authHeader = request.headers.get('authorization');

    // Check token from header or cookie
    const authToken = authHeader?.replace('Bearer ', '') || token;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In production, verify JWT token
    // For now, mock verification
    const userId = authToken.split('-').pop();
    const user = MOCK_USERS.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
