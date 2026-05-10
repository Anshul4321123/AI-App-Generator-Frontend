'use client';

import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface MultiUserSelectProps {
  value: string[];
  onChange: (userIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MultiUserSelect({
  value = [],
  onChange,
  placeholder = 'Select team members...',
  disabled = false
}: MultiUserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/auth/users/list');
        setUsers(response.data.data || []);
        // console.log('✅ Users loaded:', response.data.data?.length);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    if (value.includes(userId)) {
      onChange(value.filter(id => id !== userId));
    } else {
      onChange([...value, userId]);
    }
  };

  const toggleAll = () => {
    if (value.length === filteredUsers.length && filteredUsers.length > 0) {
      onChange([]);
    } else {
      onChange(filteredUsers.map(u => u.id));
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'team_lead': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'team_lead': return '⭐';
      default: return '👤';
    }
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);
  const selectedCount = value.length;

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Selected users display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg flex justify-between items-center cursor-pointer ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      >
        <div className="flex flex-wrap gap-1">
          {selectedCount === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 2).map((userId) => {
                const user = getUserById(userId);
                return user ? (
                  <span key={userId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {user.email.split('@')[0]}
                  </span>
                ) : null;
              })}
              {selectedCount > 2 && (
                <span className="text-xs text-gray-500">+{selectedCount - 2} more</span>
              )}
            </div>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown with checkboxes */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Select All option */}
          {filteredUsers.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && value.length === filteredUsers.length && filteredUsers.every(u => value.includes(u.id))}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Select All ({filteredUsers.length})</span>
              </label>
            </div>
          )}

          {/* Users list */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? `No users found matching "${searchTerm}"` : 'No users available'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{user.email}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Action buttons */}
          <div className="p-2 border-t border-gray-200 flex gap-2 bg-gray-50">
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Done ({selectedCount})
            </button>
          </div>
        </div>
      )}

      {/* Selected users chips (full list when closed) */}
      {selectedCount > 0 && !isOpen && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.map((userId) => {
            const user = getUserById(userId);
            return user ? (
              <span key={userId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                {user.email}
                <button
                  type="button"
                  onClick={() => toggleUser(userId)}
                  className="hover:text-blue-900 ml-1"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}