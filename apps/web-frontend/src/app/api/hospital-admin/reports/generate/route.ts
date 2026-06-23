import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.title || !body.category || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, type' },
        { status: 400 }
      )
    }

    // Generate report content based on type and filters
    // This is a placeholder - you'd implement actual report generation logic
    const reportData = {
      title: body.title,
      generatedAt: new Date().toISOString(),
      filters: body.filters,
      // Add actual data here based on body.category
    }

    // Save report to database
    const report = await prisma.report.create({
      data: {
        title: body.title,
        category: body.category,
        type: body.type,
        size: '1.2 MB', // Calculate actual size
        date: new Date().toISOString().split('T')[0],
      },
    })

    // Generate file content
    const content = JSON.stringify(reportData, null, 2)
    const blob = new Blob([content], { type: 'application/json' })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': body.type === 'pdf' ? 'application/pdf' : 
                        body.type === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                        'text/csv',
        'Content-Disposition': `attachment; filename="${body.title}.${body.type}"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}