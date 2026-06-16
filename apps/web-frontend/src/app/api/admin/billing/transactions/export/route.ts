import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, generate CSV export
    const csv = `Tenant,Amount,Date,Status,Invoice
Kenyatta National Hospital,12000,2024-12-15,paid,INV-2024-0128
Aga Khan University Hospital,24000,2024-12-14,paid,INV-2024-0126
Nairobi Hospital,4800,2024-12-01,overdue,INV-2024-0123
Mater Hospital,2400,2024-11-28,overdue,INV-2024-0118
St. Mary's Hospital,400,2024-11-25,paid,INV-2024-0115`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=transactions.csv',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
