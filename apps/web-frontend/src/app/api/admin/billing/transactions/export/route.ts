// app/api/admin/billing/transactions/export/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: { select: { name: true } },
      invoice: { select: { invoiceNumber: true } },
    },
  });

  const csv = [
    ['tenant', 'invoice', 'amountCents', 'currency', 'status', 'date'].join(','),
    ...rows.map((r) =>
      [
        `"${r.tenant.name}"`,
        `"${r.invoice.invoiceNumber}"`,
        r.amountCents,
        r.currency,
        r.status,
        r.createdAt.toISOString(),
      ].join(',')
    ),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=billing-transactions.csv',
    },
  });
}