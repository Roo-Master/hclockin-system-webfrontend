import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const device = await prisma.device.update({
      where: { id: params.id },
      data: {
        status: 'online',
        lastSeen: new Date().toISOString(),
      },
    })

    return NextResponse.json(device)
  } catch (error) {
    console.error('Error syncing device:', error)
    return NextResponse.json(
      { error: 'Failed to sync device' },
      { status: 500 }
    )
  }
}