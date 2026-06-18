import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { message: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // In production, verify the super admin is authorized
    // and fetch tenant details from database
    const tenantName = 'Tenant Name'; // Fetch from DB

    // Store impersonation session in cookie
    const sessionData = {
      tenantId,
      tenantName,
      originalUserId: 'original-user-id', // Store original user ID
      startedAt: new Date().toISOString(),
    };

    cookies().set('impersonation', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      ...sessionData,
    });
  } catch (error) {
    console.error('Start impersonation error:', error);
    return NextResponse.json(
      { message: 'Failed to start impersonation' },
      { status: 500 }
    );
  }
}
