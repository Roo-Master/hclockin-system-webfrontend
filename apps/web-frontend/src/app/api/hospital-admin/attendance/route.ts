import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    const department = searchParams.get('department')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    
    if (employeeId) {
      where.employeeId = Number(employeeId)
    }
    
    if (department) {
      where.employee = { department }
    }
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.employeeId || !body.date || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, date, status' },
        { status: 400 }
      )
    }

    // Check if attendance already exists for this date
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: body.employeeId,
        date: new Date(body.date),
      },
    })

    if (existing) {
      // Update existing record
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: body.status,
          checkIn: body.checkIn,
          checkOut: body.checkOut,
        },
      })
      return NextResponse.json(updated)
    }

    // Create new record
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: body.employeeId,
        date: new Date(body.date),
        status: body.status,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance' },
      { status: 500 }
    )
  }
}