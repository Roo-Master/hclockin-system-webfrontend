// app/api/billing/subscription/[tenantId]/[action]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/(super-admin)/prisma';

type Action = 'pause' | 'resume' | 'cancel';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string; action: Action }> }
) {
  const { tenantId, action } = await params;

  const subscription = await prisma.subscription.findFirst({
    where: { tenantId },
  });

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  const data =
    action === 'pause'
      ? { status: 'SUSPENDED', suspendedAt: new Date() }
      : action === 'resume'
      ? { status: 'ACTIVE', suspendedAt: null }
      : { status: 'CANCELED', canceledAt: new Date() };

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data,
  });

  await prisma.billingEvent.create({
    data: {
      tenantId,
      type: `SUBSCRIPTION_${action.toUpperCase()}`,
      payload: { subscriptionId: subscription.id },
    },
  });

  return NextResponse.json(updated);
}