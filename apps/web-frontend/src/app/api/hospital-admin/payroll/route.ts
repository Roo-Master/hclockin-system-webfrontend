import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const department = searchParams.get('department')
    const employeeId = searchParams.get('employeeId')

    const where: any = {}
    
    if (month) {
      where.month = month
    }
    
    if (employeeId) {
      where.employeeId = Number(employeeId)
    }
    
    if (department) {
      where.employee = { department }
    }

    const payroll = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            initials: true,
            department: true,
            role: true,
            avatarColor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match PayrollRecord type
    const transformed = payroll.map(record => ({
      employeeId: record.employeeId,
      name: record.employee.name,
      initials: record.employee.initials,
      department: record.employee.department,
      role: record.employee.role,
      avatarColor: record.employee.avatarColor,
      basicSalary: record.basicSalary,
      allowances: record.allowances,
      overtime: record.overtime,
      deductions: record.deductions,
      net: record.net,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching payroll:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payroll' },
      { status: 500 }
    )
  }
}