import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(params.id) },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Generate file content (placeholder)
    const content = `Report: ${report.title}\nGenerated: ${report.date}`
    const blob = new Blob([content], { type: 'text/plain' })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': report.type === 'pdf' ? 'application/pdf' : 
                        report.type === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                        'text/csv',
        'Content-Disposition': `attachment; filename="${report.title}.${report.type}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading report:', error)
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    )
  }
}