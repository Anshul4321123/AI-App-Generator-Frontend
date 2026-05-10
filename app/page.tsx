'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, token, checkAuth, isLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuth();
      if (isValid && user && token) {
        router.push('/dashboard');
      }
      setChecking(false);
    };
    verifyAuth();
  }, [checkAuth, router, user, token]);

  if (checking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Team Manager</h1>
        <p className="text-gray-500 mb-6">Manage your team tasks efficiently</p>
        <div className="space-x-3">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-block bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}