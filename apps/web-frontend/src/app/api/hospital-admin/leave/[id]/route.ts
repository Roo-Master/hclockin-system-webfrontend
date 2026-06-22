import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.leave.delete({
      where: { id: Number(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting leave:', error)
    return NextResponse.json(
      { error: 'Failed to delete leave' },
      { status: 500 }
    )
  }
}