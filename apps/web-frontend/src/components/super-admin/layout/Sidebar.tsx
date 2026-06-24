'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Overview',      href: '/super-admin/dashboard',      icon: '📊' },
  { label: 'Tenants',       href: '/super-admin/tenants',         icon: '🏥' },
  { label: 'Billing',       href: '/super-admin/billing',         icon: '💳' },
  { label: 'Feature Flags', href: '/super-admin/feature-flags',   icon: '🚩' },
  { label: 'Admins',        href: '/super-admin/admins',           icon: '👤' },
  { label: 'Monitoring',    href: '/super-admin/monitoring',       icon: '📡' },
  { label: 'Settings',      href: '/super-admin/settings',         icon: '⚙️'  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <div className="text-blue-400 font-bold text-lg">⏱ Chronos</div>
        <div className="text-gray-500 text-xs mt-1">Super Admin Console</div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="text-gray-500 text-xs">Logged in as Super Admin</div>
      </div>
    </aside>
  );
}

// Export as Sidebar for consistent naming
export { SuperAdminSidebar as Sidebar };
