'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Operator registration path. Redirects to the shared patient registration form
 * (mobile-first, 03xx-1234567, create encounter + order tests).
 */
export default function OperatorRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/patients/register');
  }, [router]);

  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-sm text-gray-500">Redirecting to registration…</p>
    </div>
  );
}
