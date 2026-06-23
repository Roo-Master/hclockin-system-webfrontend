import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const template = await prisma.shiftTemplate.update({
      where: { id: Number(params.id) },
      data: body,
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating shift template:', error)
    return NextResponse.json(
      { error: 'Failed to update shift template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.shiftTemplate.delete({
      where: { id: Number(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shift template:', error)
    return NextResponse.json(
      { error: 'Failed to delete shift template' },
      { status: 500 }
    )
  }
}