// src/app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toAppNotification } from '@/lib/super-admin/notifications';

// PATCH /api/notifications/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const markAsRead = body.read ?? true;

    const updated = await prisma.notificationLog.update({
      where: { id: params.id },
      data: markAsRead
        ? { status: 'READ', readAt: new Date() }
        : { status: 'DELIVERED', readAt: null },
    });

    return NextResponse.json({ notification: toAppNotification(updated) });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    console.error('Failed to update notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

// DELETE /api/notifications/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.notificationLog.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    console.error('Failed to delete notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}