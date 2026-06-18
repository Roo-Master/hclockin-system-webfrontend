import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check for impersonation cookie/session
    const impersonationData = cookies().get('impersonation');
    
    if (!impersonationData) {
      return NextResponse.json({
        isActive: false,
        tenantId: null,
        tenantName: null,
        originalUserId: null,
        startedAt: null,
      });
    }

    const data = JSON.parse(impersonationData.value);
    
    return NextResponse.json({
      isActive: true,
      tenantId: data.tenantId || null,
      tenantName: data.tenantName || null,
      originalUserId: data.originalUserId || null,
      startedAt: data.startedAt || null,
    });
  } catch (error) {
    console.error('Impersonation status error:', error);
    return NextResponse.json({
      isActive: false,
      tenantId: null,
      tenantName: null,
      originalUserId: null,
      startedAt: null,
    });
  }
}
