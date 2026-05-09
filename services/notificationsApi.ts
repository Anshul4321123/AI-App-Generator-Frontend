import api from './api';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  // Get all notifications
  getAll: () => api.get('/api/notifications'),
  
  // Get unread count
  getUnreadCount: () => api.get('/api/notifications/unread/count'),
  
  // Mark single notification as read
  markAsRead: (id: string) => api.put(`/api/notifications/${id}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};