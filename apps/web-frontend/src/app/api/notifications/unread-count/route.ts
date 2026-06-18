// src/app/api/notifications/unread-count/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const unreadCount = await prisma.notificationLog.count({
      where: {
        channel: 'IN_APP',
        status: { not: 'READ' },
        // TODO: scope by tenantId / userId once auth is in place
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Failed to fetch unread notification count:', error);
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
  }
}