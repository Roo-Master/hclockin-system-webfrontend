import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // In production, update tenant status in database
    return NextResponse.json({
      success: true,
      message: 'Tenant activated successfully',
      status: 'ACTIVE',
    });
  } catch (error) {
    console.error('Activate tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
