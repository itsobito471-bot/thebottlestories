'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Save to localStorage (or sessionStorage)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect to homepage
        router.push('/');
        router.refresh(); // Force refresh to update navbar, cart, etc.

      } catch (error) {
        console.error('Failed to parse user data:', error);
        router.push('/login?error=auth_failed');
      }
    } else {
      // Handle error
      console.error('No token or user found in callback');
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-[#1C1C1C]" />
      <p className="mt-4 text-lg text-[#444444]">
        Signing you in...
      </p>
    </div>
  );
}

// We wrap the component in a <Suspense> boundary
// because useSearchParams() requires it
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}