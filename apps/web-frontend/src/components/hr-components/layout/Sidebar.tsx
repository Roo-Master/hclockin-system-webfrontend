import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Employees', href: '/employees', icon: '👥' },
  { name: 'Attendance', href: '/attendance', icon: '📋' },
  { name: 'Leave', href: '/leave', icon: '🏖️' },
  { name: 'Shifts', href: '/shifts', icon: '🔄' },
  { name: 'Payroll', href: '/payroll', icon: '💰' },
  { name: 'Reports', href: '/reports', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Admin User', email: 'admin@citycare.com' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <div className="w-64 bg-[#0F1B3D] flex flex-col flex-shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">🏥 CityCare</h1>
        <p className="text-xs text-white/60">Hospital Admin</p>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs uppercase tracking-wider text-white/40 mb-3 px-3">Hospital Admin</p>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User Profile Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center p-3 bg-white/5 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0) || 'A'}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || 'Admin User'}</p>
            <p className="text-xs text-white/50 truncate">{user.email || 'admin@citycare.com'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Logout"
          >
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}
