/**
 * lib/stores/auth.store.ts
 * Zustand store para autenticación y estado de usuario.
 *
 * SEGURIDAD: El token JWT vive exclusivamente en una cookie httpOnly
 * gestionada por el BFF (/api/auth/*). Este store solo persiste
 * información NO sensible del usuario (username, email, role).
 *
 * Autor: GitHub Copilot (Claude Sonnet 4.6)
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
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // El BFF gestiona la cookie httpOnly — aquí solo recibimos el user
          const { user } = await apiClient.login(username, password);
          set({ user, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            (err instanceof Error ? err.message : 'Error al iniciar sesión');
          set({ isLoading: false, error: message, user: null });
          throw err;
        }
      },

      logout: async () => {
        await apiClient.logout();
        set({ user: null, error: null });
      },

      loadUser: async () => {
        try {
          const user = await apiClient.getCurrentUser();
          set({ user });
        } catch {
          set({ user: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'synaptolabs-user',
      // Solo persiste info no sensible — el token está en cookie httpOnly
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const isAdmin = (user: User | null): boolean => user?.role === 'admin';
export const isOperatorOrAbove = (user: User | null): boolean =>
  user?.role === 'admin' || user?.role === 'operator';

