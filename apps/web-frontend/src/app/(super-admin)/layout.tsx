'use client';

import { Sidebar, Header } from '@/components/layout';
import { ImpersonationBanner } from '@/components/super-admin/layout/ImpersonationBanner';
import { ToastProvider } from '@/contexts/(super-admin)/ToastContext';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto">
            <ImpersonationBanner />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}