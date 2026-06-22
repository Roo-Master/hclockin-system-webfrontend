import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month') // Format: 2025-05

    if (!employeeId || !month) {
      return NextResponse.json(
        { error: 'Missing required parameters: employeeId, month' },
        { status: 400 }
      )
    }

    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0)

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: Number(employeeId),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Transform to heatmap format
    const heatmap: Record<string, Record<number, string>> = {}
    
    attendance.forEach(record => {
      const date = new Date(record.date)
      const week = `Week ${Math.ceil(date.getDate() / 7)}`
      const day = date.getDate()
      
      if (!heatmap[week]) {
        heatmap[week] = {}
      }
      
      heatmap[week][day] = record.status
    })

    return NextResponse.json(heatmap)
  } catch (error) {
    console.error('Error fetching heatmap:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap' },
      { status: 500 }
    )
  }
}