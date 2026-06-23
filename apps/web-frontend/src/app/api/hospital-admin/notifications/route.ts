import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/hospital-admin/prisma'

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.title || !body.desc) {
      return NextResponse.json(
        { error: 'Missing required fields: title, desc' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        icon: body.icon || 'Info',
        color: body.color || 'blue',
        title: body.title,
        desc: body.desc,
        time: new Date().toISOString(),
        read: false,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}