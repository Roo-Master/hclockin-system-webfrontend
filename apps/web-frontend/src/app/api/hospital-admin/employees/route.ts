import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/super-admin/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get('department')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (department && department !== 'all') {
      where.department = department
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, department' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.employee.findUnique({
      where: { email: body.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 409 }
      )
    }

    // Generate initials if not provided
    const initials = body.initials || body.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        initials,
        role: body.role || 'Staff',
        department: body.department,
        status: body.status || 'active',
        joinDate: body.joinDate || new Date().toISOString().split('T')[0],
        email: body.email,
        phone: body.phone || '',
        avatarColor: body.avatarColor || '#3b82f6',
        salary: body.salary || 0,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}