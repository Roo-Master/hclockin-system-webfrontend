import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; tenantId: string } }
) {
  try {
    const { id, tenantId } = params;
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled flag must be a boolean' },
        { status: 400 }
      );
    }

    // In production, update tenant override in database
    return NextResponse.json({
      success: true,
      message: `Tenant flag ${enabled ? 'enabled' : 'disabled'} for ${tenantId}`,
    });
  } catch (error) {
    console.error('Toggle tenant flag error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
