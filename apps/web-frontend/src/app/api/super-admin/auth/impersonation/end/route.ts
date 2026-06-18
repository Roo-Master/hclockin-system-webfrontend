import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear impersonation cookie
    cookies().delete('impersonation');

    return NextResponse.json({
      success: true,
      message: 'Impersonation session ended',
    });
  } catch (error) {
    console.error('End impersonation error:', error);
    return NextResponse.json(
      { message: 'Failed to end impersonation' },
      { status: 500 }
    );
  }
}
