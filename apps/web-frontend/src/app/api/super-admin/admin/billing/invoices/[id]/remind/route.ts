import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // In production, send reminder email
    return NextResponse.json({
      success: true,
      message: `Reminder sent for invoice ${id}`,
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
