import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    if (!body.status || !['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    const leave = await prisma.leave.update({
      where: { id: Number(params.id) },
      data: {
        status: body.status,
        approvedBy: body.approvedBy,
        approvedAt: new Date(),
        note: body.note,
      },
      include: {
        employee: true,
      },
    })

    // If approved, create attendance records
    if (body.status === 'approved') {
      const dates: Date[] = []
      const current = new Date(leave.from)
      const end = new Date(leave.to)

      while (current <= end) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }

      await prisma.$transaction(
        dates.map(date => 
          prisma.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: leave.employeeId,
                date,
              },
            },
            update: {
              status: 'leave',
            },
            create: {
              employeeId: leave.employeeId,
              date,
              status: 'leave',
            },
          })
        )
      )
    }

    return NextResponse.json(leave)
  } catch (error) {
    console.error('Error approving leave:', error)
    return NextResponse.json(
      { error: 'Failed to approve leave' },
      { status: 500 }
    )
  }
}