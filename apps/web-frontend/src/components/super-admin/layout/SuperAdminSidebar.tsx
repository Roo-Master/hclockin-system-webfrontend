'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Overview',      href: '/dashboard',      icon: '📊' },
  { label: 'Tenants',       href: '/tenants',         icon: '🏥' },
  { label: 'Billing',       href: '/billing',         icon: '💳' },
  { label: 'Feature Flags', href: '/feature-flags',   icon: '🚩' },
  { label: 'Admins',        href: '/admins',           icon: '👤' },
  { label: 'Monitoring',    href: '/monitoring',       icon: '📡' },
  { label: 'Settings',      href: '/settings',         icon: '⚙️'  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="text-blue-400 font-bold text-lg">⏱ Chronos</div>
        <div className="text-gray-500 text-xs mt-1">Super Admin Console</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
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
