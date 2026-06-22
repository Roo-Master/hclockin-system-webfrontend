import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.month) {
      return NextResponse.json(
        { error: 'Missing required field: month' },
        { status: 400 }
      )
    }

    const where: any = { status: 'active' }
    if (body.departments && body.departments.length > 0) {
      where.department = { in: body.departments }
    }

    const employees = await prisma.employee.findMany({ where })

    // Get attendance for the month
    const [year, monthNum] = body.month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0)

    const payrollRecords = await prisma.$transaction(
      employees.map(employee => {
        // Calculate basic salary (monthly)
        const basicSalary = employee.salary

        // Calculate allowances (example: 10% of basic)
        const allowances = Math.round(basicSalary * 0.1)

        // Get overtime hours (you'll need to calculate this from attendance)
        const overtime = 0 // Placeholder

        // Calculate deductions (example: tax + insurance)
        const deductions = Math.round(basicSalary * 0.15)

        // Calculate net
        const net = basicSalary + allowances + overtime - deductions

        return prisma.payroll.upsert({
          where: {
            employeeId_month: {
              employeeId: employee.id,
              month: body.month,
            },
          },
          update: {
            basicSalary,
            allowances,
            overtime,
            deductions,
            net,
          },
          create: {
            employeeId: employee.id,
            month: body.month,
            basicSalary,
            allowances,
            overtime,
            deductions,
            net,
          },
        })
      })
    )

    return NextResponse.json({ 
      success: true, 
      count: payrollRecords.length 
    })
  } catch (error) {
    console.error('Error generating payroll:', error)
    return NextResponse.json(
      { error: 'Failed to generate payroll' },
      { status: 500 }
    )
  }
}