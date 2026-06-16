// app/api/admin/billing/invoices/[id]/mark-paid/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        tenantId: invoice.tenantId,
        invoiceId: invoice.id,
        amountCents: invoice.totalCents,
        currency: invoice.currency,
        status: 'SUCCEEDED',
        method: 'MANUAL',
        paidAt: new Date(),
      },
    }),
    prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    }),
    prisma.billingEvent.create({
      data: {
        tenantId: invoice.tenantId,
        type: 'INVOICE_MARKED_PAID',
        payload: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}