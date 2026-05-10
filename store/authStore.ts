import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.error || 'Login failed');
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { email, password });
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.error || 'Registration failed');
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
        window.location.href = '/login';
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return false;

        try {
          const response = await api.get('/auth/me');
          const userData = response.data.data;
          set({ user: userData });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);