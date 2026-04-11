/**
 * lib/stores/auth.store.ts
 * Zustand store para autenticación y estado de usuario.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';

export interface User {
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer' | string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.login(username, password);
          // Escribir cookie que lee el middleware
          document.cookie = `synaptolabs-token=${data.access_token}; path=/; samesite=strict; max-age=3600`;
          set({ token: data.access_token, isLoading: false });
          await get().loadUser();
        } catch (err: any) {
          const message =
            err?.response?.data?.detail ||
            err?.message ||
            'Error al iniciar sesión';
          set({ isLoading: false, error: message, token: null, user: null });
          throw err;
        }
      },

      logout: () => {
        apiClient.logout();
        // Eliminar cookie de middleware
        document.cookie = 'synaptolabs-token=; path=/; max-age=0';
        set({ user: null, token: null, error: null });
      },

      loadUser: async () => {
        try {
          const user = await apiClient.getCurrentUser();
          set({ user });
        } catch {
          set({ user: null, token: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'synaptolabs-auth',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          // Restaurar token en el cliente API
          apiClient.setToken(state.token);
        }
      },
    }
  )
);

export const isAdmin = (user: User | null) => user?.role === 'admin';
export const isOperatorOrAbove = (user: User | null) =>
  user?.role === 'admin' || user?.role === 'operator';
