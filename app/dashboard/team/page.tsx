'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../services/api';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'team_lead' | 'member';
  created_at: string;
}

export default function TeamManagementPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await api.get('/auth/users');
      setUsers(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole as User['role'] } : u
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'team_lead':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'team_lead':
        return '⭐';
      default:
        return '👤';
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
        <p className="text-red-700">Only administrators can access team management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchUsers} 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Team Management</h1>
            <p className="text-purple-100 mt-1">Manage user roles and permissions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">System Users</h2>
          <p className="text-sm text-gray-500 mt-1">Select a role from the dropdown to change user permissions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Since
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {u.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.email}
                        </div>
                        {u.id === user?.id && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(u.role)}`}>
                      <span>{getRoleIcon(u.role)}</span>
                      <span>{u.role === 'admin' ? 'Admin' : u.role === 'team_lead' ? 'Team Lead' : 'Member'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                    aria-label='role'
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      disabled={updatingId === u.id || u.id === user?.id}
                      className={`px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
                        u.id === user?.id ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      }`}
                    >
                      <option value="member">👤 Member</option>
                      <option value="team_lead">⭐ Team Lead</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                    {updatingId === u.id && (
                      <span className="ml-2 inline-block animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></span>
                    )}
                    {u.id === user?.id && (
                      <p className="text-xs text-gray-400 mt-1">Cannot change your own role</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found in the system.
          </div>
        )}

        {/* Role Description Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              <span className="font-medium text-gray-700">👑 Admin</span>
              <span className="text-gray-500">- Full access to everything</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span className="font-medium text-gray-700">⭐ Team Lead</span>
              <span className="text-gray-500">- Manage teams, create tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
              <span className="font-medium text-gray-700">👤 Member</span>
              <span className="text-gray-500">- View and update own tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}