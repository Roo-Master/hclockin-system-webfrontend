import React from 'react';
import { FileBarChart } from 'lucide-react';

export default function PayrollReports() {
  return (
    <div className="min-h-screen bg-page p-6">
      <h1 className="text-display font-semibold text-primary mb-6">Payroll Reports</h1>
      <div className="bg-surface rounded-xl border border-border p-8 text-center">
        <FileBarChart className="w-16 h-16 text-tertiary mx-auto mb-4 opacity-50" />
        <h3 className="text-heading font-semibold text-primary mb-2">No Reports Available</h3>
        <p className="text-secondary">Generate payroll reports here</p>
      </div>
    </div>
  );
}
