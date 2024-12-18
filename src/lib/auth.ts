'use client';

import { create } from 'zustand';
import api from './api';

interface User {
  id: string;
  email: string;
  name?: string;
  // 필요한 다른 사용자 정보 필드들을 여기에 추가
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  checkAuth: async () => {
    try {
      const response = await api.get('/api/v1/auth/check');
      set({ isAuthenticated: true, user: response.data.user });
      return true;
    } catch (error) {
      set({ isAuthenticated: false, user: null });
      console.error(error)
      return false;
    }
  },
  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout');
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}));