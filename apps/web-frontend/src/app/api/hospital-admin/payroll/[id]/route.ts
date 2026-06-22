import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Recalculate net if any component changes
    const net = (body.basicSalary || 0) + 
                (body.allowances || 0) + 
                (body.overtime || 0) - 
                (body.deductions || 0)

    const payroll = await prisma.payroll.update({
      where: { id: Number(params.id) },
      data: {
        ...body,
        net,
      },
    })

    return NextResponse.json(payroll)
  } catch (error) {
    console.error('Error updating payroll:', error)
    return NextResponse.json(
      { error: 'Failed to update payroll' },
      { status: 500 }
    )
  }
}