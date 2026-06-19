'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'super_admin') {
      router.push('/super-admin/dashboard');
    } else if (token) {
      // Redirect to hospital admin dashboard
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);
  
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </main>
  );
}