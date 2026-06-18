import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // In production, update invoice status in database
    return NextResponse.json({
      success: true,
      message: `Invoice ${id} marked as paid`,
    });
  } catch (error) {
    console.error('Mark paid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
