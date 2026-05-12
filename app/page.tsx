'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, token, checkAuth } = useAuthStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (hasRedirected.current) return;

      const isValid = await checkAuth();

      hasRedirected.current = true;

      // ✅ If authenticated → dashboard
      if (isValid && user && token) {
        router.replace('/dashboard');
      } 
      // ✅ Otherwise → login page
      else {
        router.replace('/login');
      }
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional loading screen while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}