import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')
    const department = searchParams.get('department')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (employeeId) {
      where.employeeId = Number(employeeId)
    }
    
    if (department) {
      where.employee = { department }
    }
    
    if (startDate || endDate) {
      where.from = {}
      if (startDate) where.from.gte = new Date(startDate)
      if (endDate) where.from.lte = new Date(endDate)
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            initials: true,
            department: true,
            avatarColor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match LeaveRecord type
    const transformed = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employeeId,
      name: leave.employee.name,
      initials: leave.employee.initials,
      department: leave.employee.department,
      type: leave.type,
      from: leave.from.toISOString().split('T')[0],
      to: leave.to.toISOString().split('T')[0],
      days: leave.days,
      avatarColor: leave.employee.avatarColor,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching leaves:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaves' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.employeeId || !body.type || !body.from || !body.to) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, type, from, to' },
        { status: 400 }
      )
    }

    // Calculate days
    const fromDate = new Date(body.from)
    const toDate = new Date(body.to)
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const leave = await prisma.leave.create({
      data: {
        employeeId: body.employeeId,
        type: body.type,
        from: fromDate,
        to: toDate,
        days,
        status: 'pending',
        reason: body.reason || '',
      },
      include: {
        employee: true,
      },
    })

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    console.error('Error creating leave:', error)
    return NextResponse.json(
      { error: 'Failed to create leave' },
      { status: 500 }
    )
  }
}