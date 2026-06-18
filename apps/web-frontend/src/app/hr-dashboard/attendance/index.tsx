import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Attendance() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/hr-pages/attendance');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Redirecting to attendance...</p>
    </div>
  );
}
