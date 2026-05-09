'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConfig } from '../../../hooks/useConfig';
import PageRenderer from '../../../components/renderer/PageRenderer';
import CSVImport from '../../../components/CSVImport';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import { useState, useCallback } from 'react';

export default function AppPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as string;
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  
  const { config, loading, error, warnings } = useConfig(appId);

  // Force refresh of all child components
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing all components...');
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get available entities from pages
  const availableEntities = config?.pages
    ?.filter(page => page.entity)
    ?.map(page => page.entity)
    ?.filter((value, index, self) => self.indexOf(value) === index) || [];

  // Set default entity when config loads
  if (config && !selectedEntity && availableEntities.length > 0) {
    setSelectedEntity(availableEntities[0]);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">No configuration found for this app.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* App Info Banner with Logout */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{config.name}</h1>
            <p className="text-blue-100 text-sm mt-1">
              Manage your {config.pages?.length || 0} page{config.pages?.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Navigation and Logout */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            
            <Link
              href="/dashboard/all-apps"
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              All Apps
            </Link>
            
            <Link
              href="/dashboard/create"
              className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New App
            </Link>
            
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* CSV Import Section - Only show if entities available */}
      {availableEntities.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Import to entity:</label>
            <select
              aria-label='selector'
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {availableEntities.map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
          
          <CSVImport 
            key={`csv-${refreshKey}`}
            entity={selectedEntity} 
            onSuccess={handleRefresh}
            onError={(err) => console.error('Import error:', err)}
          />
        </div>
      )}
      
      {/* Dynamic Page Renderer */}
      <div key={`renderer-${refreshKey}`}>
        <PageRenderer 
          config={config} 
          warnings={warnings}
          onRecordCreated={handleRefresh}
          onRecordDeleted={handleRefresh}
        />
      </div>
    </div>
  );
}