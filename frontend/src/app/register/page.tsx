'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step 1
    router.push('/register/step1');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang chuyển hướng...</p>
    </div>
  );
}
