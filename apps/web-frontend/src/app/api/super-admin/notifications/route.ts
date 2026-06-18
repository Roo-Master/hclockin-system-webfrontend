// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/(super-admin)/prisma';
import { toAppNotification } from '@/lib/(super-admin)/super-admin/notifications';

// GET /api/notifications -> list all notifications
export async function GET() {
  try {
    const items = await prisma.notificationLog.findMany({
      where: { channel: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
      // TODO: scope by tenantId / userId once auth is in place
    });

    return NextResponse.json({ notifications: items.map(toAppNotification) });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications -> mark every notification as read
export async function POST() {
  try {
    await prisma.notificationLog.updateMany({
      where: {
        channel: 'IN_APP',
        status: { not: 'READ' },
        // TODO: scope by tenantId / userId once auth is in place
      },
      data: { status: 'READ', readAt: new Date() },
    });

    const items = await prisma.notificationLog.findMany({
      where: { channel: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notifications: items.map(toAppNotification) });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}