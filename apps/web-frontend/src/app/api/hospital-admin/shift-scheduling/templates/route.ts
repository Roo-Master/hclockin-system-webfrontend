import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET() {
  try {
    const templates = await prisma.shiftTemplate.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching shift templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shift templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.start || !body.end) {
      return NextResponse.json(
        { error: 'Missing required fields: name, start, end' },
        { status: 400 }
      )
    }

    const template = await prisma.shiftTemplate.create({
      data: {
        name: body.name,
        start: body.start,
        end: body.end,
        color: body.color || '#3b82f6',
        bg: body.bg || '#dbeafe',
        depts: body.depts || [],
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating shift template:', error)
    return NextResponse.json(
      { error: 'Failed to create shift template' },
      { status: 500 }
    )
  }
}