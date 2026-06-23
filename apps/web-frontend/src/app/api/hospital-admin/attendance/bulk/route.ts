import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: 'Request body must be a non-empty array' },
        { status: 400 }
      )
    }

    // Bulk create attendance records
    const results = await prisma.$transaction(
      body.map(record => 
        prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: record.employeeId,
              date: new Date(record.date),
            },
          },
          update: {
            status: record.status,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
          },
          create: {
            employeeId: record.employeeId,
            date: new Date(record.date),
            status: record.status,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
          },
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      count: results.length 
    })
  } catch (error) {
    console.error('Error bulk creating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to bulk create attendance' },
      { status: 500 }
    )
  }
}