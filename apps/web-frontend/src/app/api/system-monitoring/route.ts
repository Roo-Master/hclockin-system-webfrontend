import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      services,
      errors,
      connections,
      uptime,
    ] = await Promise.all([
      prisma.service.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.systemEvent.findMany({
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
      prisma.webSocketSession.aggregate({
        _count: true,
        where: { isActive: true },
      }),
      prisma.uptimeSnapshot.findMany({
        orderBy: { day: 'asc' },
        take: 7,
      }),
    ]);

    const metrics = [
      {
        label: 'Active Connections',
        value: String(connections._count ?? 0),
        sub: 'WebSocket sessions',
        status: 'healthy',
        delta: '+12',
        deltaDir: 'up',
      },
    ];

    return NextResponse.json({
      metrics,
      services,
      errors,
      wsSnap: {
        total: connections._count ?? 0,
        authenticated: 0,
        anonymous: 0,
        peakToday: 0,
        messagesPerSec: 0,
      },
      uptimeBars: uptime.map((u) => ({
        day: u.day,
        pct: u.pct,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load system monitor data' },
      { status: 500 }
    );
  }
}