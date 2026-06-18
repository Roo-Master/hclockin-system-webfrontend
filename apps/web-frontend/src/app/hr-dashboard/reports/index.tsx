import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Reports() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/hr-pages/reports');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Redirecting to reports...</p>
    </div>
  );
}
