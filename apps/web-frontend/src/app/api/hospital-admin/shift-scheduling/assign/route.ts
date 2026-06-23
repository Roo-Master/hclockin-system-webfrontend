import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.employeeId || !body.shiftTemplateId || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, shiftTemplateId, date' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const existing = await prisma.shiftAssignment.findFirst({
      where: {
        employeeId: body.employeeId,
        date: new Date(body.date),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Employee already has a shift assigned for this date' },
        { status: 409 }
      )
    }

    const assignment = await prisma.shiftAssignment.create({
      data: {
        employeeId: body.employeeId,
        shiftTemplateId: body.shiftTemplateId,
        date: new Date(body.date),
      },
      include: {
        employee: true,
        shiftTemplate: true,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error assigning shift:', error)
    return NextResponse.json(
      { error: 'Failed to assign shift' },
      { status: 500 }
    )
  }
}