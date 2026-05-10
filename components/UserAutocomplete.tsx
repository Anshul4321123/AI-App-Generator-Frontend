'use client';

import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface UserAutocompleteProps {
  value: string;
  onChange: (userId: string, email: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function UserAutocomplete({
  value,
  onChange,
  placeholder = 'Search user by email...',
  required = false,
  disabled = false
}: UserAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/auth/users/list');
        setUsers(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Update search term when value prop changes
  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers([]);
      return;
    }
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered.slice(0, 10));
  }, [searchTerm, users]);

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

  const handleSelectUser = (user: User) => {
    setSearchTerm(user.email);
    onChange(user.id, user.email);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    if (newValue === '') {
      onChange('', '');
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        required={required}
      />
      
      {loading && (
        <div className="absolute right-3 top-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {isOpen && filteredUsers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-800">{user.email}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user.role === 'team_lead' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {user.role}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && searchTerm && filteredUsers.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
          No users found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}