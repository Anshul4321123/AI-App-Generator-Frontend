'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { taskManagerTemplates } from '../../templates/taskManager';

interface App {
  id: string;
  name: string;
  config?: any;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreatingTaskManager, setIsCreatingTaskManager] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchApps = async () => {
    try {
      const response = await api.get('/api/apps');
      setApps(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch apps:', err);
      setError(err.response?.data?.error || 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

const createTaskManager = async () => {
  const appName = prompt('Enter a name for your Task Manager:', 'Team Tasks');
  
  if (!appName) return;
  
  try {
    const checkResponse = await api.post('/api/apps/check-name', { name: appName });
    if (checkResponse.data.exists) {
      alert(`An app named "${appName}" already exists. Please choose a different name.`);
      return;
    }
  } catch (err) {
    console.error('Failed to check app name:', err);
  }
  
  setIsCreatingTaskManager(true);
  try {
    const template = taskManagerTemplates.team;
    const { name, config } = template.generate(appName);  // ✅ Now accepts appName
    
    const response = await api.post('/api/apps', { name, config });
    const newApp = response.data.data;
    
    alert(`✅ Task Manager "${name}" created successfully!`);
    await fetchApps();
    router.push(`/app/${newApp.id}`);
  } catch (err: any) {
    console.error('Failed to create Task Manager:', err);
    alert(err.response?.data?.error || 'Failed to create Task Manager. Please try again.');
  } finally {
    setIsCreatingTaskManager(false);
  }
};

const createPersonalTasks = async () => {
  const appName = prompt('Enter a name for your Personal Tasks:', 'My Tasks');
  
  if (!appName) return;
  
  // Check if name already exists
  try {
    const checkResponse = await api.post('/api/apps/check-name', { name: appName });
    if (checkResponse.data.exists) {
      alert(`An app named "${appName}" already exists. Please choose a different name.`);
      return;
    }
  } catch (err) {
    console.error('Failed to check app name:', err);
  }
  
  try {
    const template = taskManagerTemplates.personal;
    const { name, config } = template.generate(appName);  // ✅ Now accepts appName
    
    const response = await api.post('/api/apps', { name, config });
    const newApp = response.data.data;
    
    alert(`✅ "${name}" created successfully!`);
    await fetchApps();
    router.push(`/app/${newApp.id}`);
  } catch (err: any) {
    console.error('Failed to create Personal Tasks:', err);
    alert('Failed to create Personal Tasks. Please try again.');
  }
};

const createSprintPlanner = async () => {
  const appName = prompt('Enter a name for your Sprint Planner:', 'Sprint Planner');
  
  if (!appName) return;
  
  try {
    const checkResponse = await api.post('/api/apps/check-name', { name: appName });
    if (checkResponse.data.exists) {
      alert(`An app named "${appName}" already exists. Please choose a different name.`);
      return;
    }
  } catch (err) {
    console.error('Failed to check app name:', err);
  }
  
  try {
    const template = taskManagerTemplates.sprint;
    const { name, config } = template.generate(appName);  // ✅ Now accepts appName
    
    const response = await api.post('/api/apps', { name, config });
    const newApp = response.data.data;
    
    alert(`✅ "${name}" created successfully!`);
    await fetchApps();
    router.push(`/app/${newApp.id}`);
  } catch (err: any) {
    console.error('Failed to create Sprint Planner:', err);
    alert('Failed to create Sprint Planner. Please try again.');
  }
};

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/api/apps/${id}`);
      await fetchApps();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete app');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    fetchApps();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Welcome Section with Logout */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
            <p className="text-blue-100 mt-1">Create and manage your AI-powered applications</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Custom App
              </Link>
              
              <button
                onClick={createTaskManager}
                disabled={isCreatingTaskManager}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {isCreatingTaskManager ? 'Creating...' : 'Team Task Manager'}
              </button>
            </div>
          </div>
          
          {/* Right side buttons - Team Management + Logout */}
          <div className="flex items-center gap-3">
            {/* Team Management Button - Admin Only */}
            {isAdmin && (
              <Link
                href="/dashboard/team"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Team Management
              </Link>
            )}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{apps.length}</p>
              <p className="text-sm text-gray-500">Total Apps</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {apps.filter(a => a.config?.pages?.length > 0).length}
              </p>
              <p className="text-sm text-gray-500">Active Apps</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {apps.reduce((sum, app) => sum + (app.config?.pages?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Total Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Templates Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Start Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Personal Tasks Template */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Personal Tasks</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Simple task manager for personal use. Track your daily tasks with status and priority.</p>
            <button
              onClick={createPersonalTasks}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              Create →
            </button>
          </div>

          {/* Team Task Manager Template */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Team Task Manager</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Complete team task management with projects, priorities, and team assignments.</p>
            <button
              onClick={createTaskManager}
              disabled={isCreatingTaskManager}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {isCreatingTaskManager ? 'Creating...' : 'Create →'}
            </button>
          </div>

          {/* Sprint Planner Template */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Sprint Planner</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Agile sprint planning and tracking with story points and sprint goals.</p>
            <button
              onClick={createSprintPlanner}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              Create →
            </button>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📱 Your Applications</h2>
        
        {apps.length === 0 && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Apps Yet</h3>
            <p className="text-gray-600">Click "Create Custom App" or choose a template above to build your first application.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const isTaskManager = app.config?.type === 'task-manager' || 
                                  app.config?.type === 'sprint-planner' ||
                                  (app.name?.toLowerCase().includes('task') || app.name?.toLowerCase().includes('sprint'));
            
            return (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-200 border border-gray-200 overflow-hidden group"
              >
                <Link href={`/app/${app.id}`} className="block">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isTaskManager 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {isTaskManager ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {app.name}
                          </h3>
                          {isTaskManager && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Task Manager
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {app.config?.pages?.length || 0} pages
                      </span>
                      <span className="text-blue-600 group-hover:translate-x-1 transition-transform inline-block">
                        Launch →
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {app.config?.type === 'task-manager' ? '📋 Task Manager' : app.config?.type === 'sprint-planner' ? '🏃 Sprint Planner' : 'ID: ' + app.id.slice(0, 8) + '...'}
                  </span>
                  <button
                    onClick={() => handleDelete(app.id, app.name)}
                    disabled={deletingId === app.id}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {deletingId === app.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}