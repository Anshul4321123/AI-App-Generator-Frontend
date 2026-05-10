'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../services/api';
import TaskEditModal from '../../../components/TaskEditModal';

interface Task {
  id: string;
  data: {
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'high' | 'medium' | 'low';
    assigned_users?: string[];
    assigned_to?: string;
    due_date?: string;
    description?: string;
    story_points?: number;
  };
  created_at: string;
}

interface DashboardMetrics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
}

// Helper to get user email from ID (simplified - you can enhance with user cache)
const getDisplayName = (userId: string) => {
  return userId.slice(0, 8) + '...';
};

export default function TasksDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const isAdmin = user?.role === 'admin';

  const fetchDashboard = async () => {
    try {
      const [metricsRes, tasksRes] = await Promise.all([
        api.get('/api/tasks/dashboard'),
        api.get(`/api/tasks${filter !== 'all' ? `?status=${filter}` : ''}`)
      ]);
      
      setMetrics(metricsRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      await fetchDashboard();
    } catch (err: any) {
      console.error('Failed to update task:', err);
      alert(err.response?.data?.error || 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'done': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Parse assigned users from JSON string or array
  const getAssignedUsers = (task: Task): string[] => {
    if (task.data.assigned_users && Array.isArray(task.data.assigned_users)) {
      return task.data.assigned_users;
    }
    if (task.data.assigned_to) {
      return [task.data.assigned_to];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track your tasks</p>
        </div>
        <div className="flex gap-3">
          <select
            aria-label='filter'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Completed</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.total_tasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{metrics.completed_tasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{metrics.pending_tasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{metrics.overdue_tasks}</p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
          <span className="text-sm text-gray-500">{tasks.length} tasks</span>
        </div>
        
        <div className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found. Create tasks from your Task Manager app.
            </div>
          ) : (
            tasks.map((task) => {
              const assignedUsers = getAssignedUsers(task);
              return (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{task.data.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.data.status)}`}>
                          {task.data.status?.replace('_', ' ') || 'todo'}
                        </span>
                        {task.data.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.data.priority)}`}>
                            {task.data.priority}
                          </span>
                        )}
                        {isOverdue(task.data.due_date) && task.data.status !== 'done' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                      {task.data.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.data.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {assignedUsers.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>👥 Assigned to:</span>
                            <div className="flex gap-1">
                              {assignedUsers.map((uid) => (
                                <span key={uid} className="bg-gray-100 px-2 py-0.5 rounded-full">
                                  {getDisplayName(uid)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {task.data.story_points && task.data.story_points > 0 && (
                          <span>⭐ {task.data.story_points} points</span>
                        )}
                        {task.data.due_date && (
                          <span>📅 Due: {new Date(task.data.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {/* Edit Button */}
                      {isAdmin && (
                        <button
                          onClick={() => setEditingTask(task)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      )}
                      {/* Status Update Buttons */}
                      {task.data.status !== 'done' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          disabled={updatingTaskId === task.id}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      {task.data.status === 'todo' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          disabled={updatingTaskId === task.id}
                          className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {task.data.status === 'in_progress' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'todo')}
                          disabled={updatingTaskId === task.id}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                          Move to Todo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSave={() => {
            fetchDashboard();
            setEditingTask(null);
          }}
          isAdmin={isAdmin}
        />
      )}

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          💡 Tip: Admins can edit all tasks. Members can only update status of tasks assigned to them.
        </p>
      </div>
    </div>
  );
}