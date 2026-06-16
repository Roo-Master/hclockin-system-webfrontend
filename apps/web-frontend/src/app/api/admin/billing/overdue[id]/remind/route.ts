// app/api/admin/billing/overdue/[id]/remind/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { tenant: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  await prisma.billingEvent.create({
    data: {
      tenantId: invoice.tenantId,
      type: 'OVERDUE_REMINDER_SENT',
      payload: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        email: invoice.tenant.adminEmail,
      },
    },
  });

  return NextResponse.json({ ok: true });
}