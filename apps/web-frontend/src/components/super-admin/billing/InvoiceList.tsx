'use client';

import { useState } from 'react';

interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onPay?: (id: string) => void;
  onDownload?: (id: string) => void;
  onRefund?: (id: string) => void;
  isLoading?: boolean;
}

export function InvoiceList({ 
  invoices, 
  onPay, 
  onDownload, 
  onRefund,
  isLoading = false 
}: InvoiceListProps) {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');

  const filteredInvoices = invoices.filter(
    (inv) => filter === 'all' || inv.status === filter
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F6FA] flex items-center justify-between">
        <h3 className="font-semibold text-[#111827]">Invoices</h3>
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filter === status 
                  ? 'bg-[#2563EB] text-white' 
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F5F6FA]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {filteredInvoices.length === 0 ? (
        <div className="p-8 text-center text-sm text-[#6B7280]">
          No {filter !== 'all' ? filter : ''} invoices found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFC]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F5F6FA] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#111827]">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-[#111827]">{inv.tenantName}</td>
                  <td className="px-4 py-3 font-medium text-[#111827]">
                    {inv.currency} {inv.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      inv.status === 'paid' 
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : inv.status === 'pending'
                        ? 'bg-[#FFEDD5] text-[#EA580C]'
                        : inv.status === 'failed'
                        ? 'bg-[#FEE2E2] text-[#DC2626]'
                        : 'bg-[#F5F6FA] text-[#6B7280]'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] text-xs">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {inv.status === 'pending' && (
                        <button 
                          onClick={() => onPay?.(inv.id)}
                          className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                        >
                          Pay
                        </button>
                      )}
                      {inv.pdfUrl && (
                        <button 
                          onClick={() => onDownload?.(inv.id)}
                          className="text-xs text-[#6B7280] hover:text-[#111827] font-medium"
                        >
                          PDF
                        </button>
                      )}
                      {inv.status === 'paid' && (
                        <button 
                          onClick={() => onRefund?.(inv.id)}
                          className="text-xs text-[#DC2626] hover:text-[#B91C1C] font-medium"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}