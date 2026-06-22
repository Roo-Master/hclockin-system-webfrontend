import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.costCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, costCode' },
        { status: 400 }
      )
    }

    // Check for duplicate department name
    const existing = await prisma.department.findFirst({
      where: { name: body.name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Department with this name already exists' },
        { status: 409 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name: body.name,
        headId: body.headId || '',
        costCode: body.costCode,
        floor: body.floor || '',
      },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}