import React from 'react';
import { Receipt } from 'lucide-react';

export default function Payslips() {
  return (
    <div className="min-h-screen bg-page p-6">
      <h1 className="text-display font-semibold text-primary mb-6">Payslips</h1>
      <div className="bg-surface rounded-xl border border-border p-8 text-center">
        <Receipt className="w-16 h-16 text-tertiary mx-auto mb-4 opacity-50" />
        <h3 className="text-heading font-semibold text-primary mb-2">No Payslips</h3>
        <p className="text-secondary">Generated payslips will appear here</p>
      </div>
    </div>
  );
}
