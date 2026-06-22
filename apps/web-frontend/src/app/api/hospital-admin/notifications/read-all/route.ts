import { NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function POST() {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    )
  }
}