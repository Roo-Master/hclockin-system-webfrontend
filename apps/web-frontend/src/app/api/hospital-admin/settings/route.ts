import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          hospitalName: 'General Hospital',
          timezone: 'Africa/Nairobi',
          gracePeriod: '15',
          workHours: '8',
          otMultiplier: '1.5',
          emailAlerts: true,
          smsAlerts: false,
          deviceAlerts: true,
          autoRecon: true,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    let settings = await prisma.settings.findFirst()

    if (!settings) {
      settings = await prisma.settings.create({
        data: body,
      })
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: body,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}