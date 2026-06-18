// app/api/admin/billing/plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/(super-admin)/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.subscriptionPlan.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.code !== undefined ? { code: body.code } : {}),
      ...(body.priceCents !== undefined ? { priceCents: body.priceCents } : {}),
      ...(body.currency !== undefined ? { currency: body.currency } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
  });

  return NextResponse.json(updated);
}