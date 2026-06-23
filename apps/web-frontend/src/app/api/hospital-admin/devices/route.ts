import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(devices)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.location || !body.ip) {
      return NextResponse.json(
        { error: 'Missing required fields: name, location, ip' },
        { status: 400 }
      )
    }

    // Generate device ID if not provided
    const id = body.id || `DEV-${Date.now()}`

    const device = await prisma.device.create({
      data: {
        id,
        name: body.name,
        location: body.location,
        status: 'offline',
        lastSeen: new Date().toISOString(),
        firmware: body.firmware || 'v2.4.0',
        ip: body.ip,
      },
    })

    return NextResponse.json(device, { status: 201 })
  } catch (error) {
    console.error('Error creating device:', error)
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    )
  }
}