'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api'; // Make sure this import is correct

interface App {
  id: string;
  name: string;
  config?: any;
  created_at: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        console.log('📡 Fetching apps from /api/apps'); // ADD THIS LOG
        const response = await api.get('/api/apps');
        console.log('✅ API Response:', response.data); // ADD THIS LOG
        setApps(response.data.data || []);
      } catch (err: any) {
        console.error('❌ Failed to fetch apps:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load apps');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold">App Engine</h1>
              <button onClick={logout} className="text-red-600">Logout</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading apps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">App Engine</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={logout} className="text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Apps</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
        
        {apps.length === 0 && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-800">No apps found.</p>
            <p className="text-sm text-gray-600 mt-2">Your User ID: {user?.id}</p>
            <p className="text-xs text-gray-500 mt-4">Debug: Check browser console for API response</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/app/${app.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{app.name}</h3>
              <p className="text-sm text-gray-500">
                {app.config?.pages?.length || 0} pages configured
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}