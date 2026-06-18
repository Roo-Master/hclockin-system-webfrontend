import { SuperAdminSidebar } from '@/components/super-admin/layout/SuperAdminSidebar';
import { SuperAdminTopbar } from '@/components/super-admin/layout/SuperAdminTopbar';
import { ImpersonationBanner } from '@/components/super-admin/layout/ImpersonationBanner';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <SuperAdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ImpersonationBanner />
        <SuperAdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
