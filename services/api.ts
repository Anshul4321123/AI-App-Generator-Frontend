import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Records API (dynamic CRUD)
export const recordsApi = {
  getAll: (entity: string) => api.get(`/api/${entity}`),
  getById: (entity: string, id: string) => api.get(`/api/${entity}/${id}`),
  create: (entity: string, data: any) => api.post(`/api/${entity}`, data),
  update: (entity: string, id: string, data: any) =>
    api.put(`/api/${entity}/${id}`, data),
  delete: (entity: string, id: string) => api.delete(`/api/${entity}/${id}`),
};

// Apps API (config)
export const appsApi = {
  getApp: (appId: string) => api.get(`/api/apps/${appId}`),
  getMyApps: () => api.get('/api/apps'),
  createApp: (name: string, config: any) => api.post('/api/apps', { name, config }),
  updateApp: (appId: string, data: any) => api.put(`/api/apps/${appId}`, data),
  deleteApp: (appId: string) => api.delete(`/api/apps/${appId}`),
};

export default api;