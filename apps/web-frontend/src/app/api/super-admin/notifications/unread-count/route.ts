import { NextResponse } from 'next/server';
import { prisma } from '@/lib/(super-admin)/prisma';

export async function GET() {
  try {
    // Check if the table exists before querying
    await prisma.$queryRaw`SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_logs'`;

    const unreadCount = await prisma.notificationLog.count({
      where: {
        channel: 'IN_APP',
        status: { not: 'READ' },
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error: unknown) {
    // Table doesn't exist yet — migrations pending
    if (
      error instanceof Error &&
      error.message.includes('notification_logs')
    ) {
      return NextResponse.json({ unreadCount: 0 });
    }

    console.error('Failed to fetch unread notification count:', error);
    return NextResponse.json({ unreadCount: 0 }, { status: 500 });
  }
}