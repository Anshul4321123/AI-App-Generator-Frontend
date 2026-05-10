'use client';

import { useState } from 'react';
import api from '../services/api';
import MultiUserSelect from './MultiUserSelect';

interface Task {
  id: string;
  data: {
    title: string;
    status: string;
    priority: string;
    assigned_users?: string[];
    assigned_to?: string;
    due_date?: string;
    description?: string;
    story_points?: number;
  };
}

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isAdmin: boolean;
}

export default function TaskEditModal({ task, isOpen, onClose, onSave, isAdmin }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: task.data.title || '',
    status: task.data.status || 'todo',
    priority: task.data.priority || 'medium',
    assigned_users: task.data.assigned_users || (task.data.assigned_to ? [task.data.assigned_to] : []),
    due_date: task.data.due_date || '',
    description: task.data.description || '',
    story_points: task.data.story_points || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        title: formData.title,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date,
        description: formData.description,
        story_points: formData.story_points,
        assigned_users: formData.assigned_users
      };

      await api.put(`/api/tasks/${task.id}`, updateData);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Edit Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
            aria-label='b'
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
            aria-label='f'
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
            aria-label='bc'
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Users</label>
            <MultiUserSelect
              value={formData.assigned_users}
              onChange={(values) => setFormData(prev => ({ ...prev, assigned_users: values }))}
              placeholder="Search users..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
            aria-label='bg'
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
            <input
            aria-label='l'
              type="number"
              value={formData.story_points}
              onChange={(e) => setFormData(prev => ({ ...prev, story_points: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
            aria-label='a'
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}