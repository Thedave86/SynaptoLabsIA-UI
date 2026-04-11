import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock apiClient antes de importar el store
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
    setToken: vi.fn(),
    isAuthenticated: vi.fn(() => false),
    getCurrentUser: vi.fn(),
  },
}));

// Mock de document.cookie
let cookieStore = '';
Object.defineProperty(document, 'cookie', {
  get: vi.fn(() => cookieStore),
  set: vi.fn((v: string) => { cookieStore = v; }),
  configurable: true,
});

import { useAuthStore } from '@/lib/stores/auth.store';
import { apiClient } from '@/lib/api-client';

describe('useAuthStore', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().logout();
    });
    vi.clearAllMocks();
  });

  it('estado inicial: no autenticado', () => {
    const { user, token, isLoading } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isLoading).toBe(false);
  });

  it('login exitoso actualiza user y token', async () => {
    const mockUser = { username: 'admin', email: 'admin@test.com', role: 'admin' };
    const mockToken = 'test-token-123';
    (apiClient.login as any).mockResolvedValue({ access_token: mockToken, token_type: 'bearer' });
    (apiClient.getCurrentUser as any).mockResolvedValue(mockUser);

    await act(async () => {
      await useAuthStore.getState().login('admin', 'admin');
    });

    const { user, token, error } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(token).toBe(mockToken);
    expect(error).toBeNull();
  });

  it('login fallido guarda error', async () => {
    (apiClient.login as any).mockRejectedValue(new Error('Credenciales inválidas'));

    await act(async () => {
      try {
        await useAuthStore.getState().login('wrong', 'wrong');
      } catch {
        // esperado
      }
    });

    const { user, token, error } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(error).toContain('Credenciales inválidas');
  });

  it('logout limpia el estado', async () => {
    const mockUser = { username: 'admin', email: 'a@b.com', role: 'admin' };
    (apiClient.login as any).mockResolvedValue({ access_token: 'tok', token_type: 'bearer' });
    (apiClient.getCurrentUser as any).mockResolvedValue(mockUser);

    await act(async () => {
      await useAuthStore.getState().login('admin', 'admin');
    });

    act(() => {
      useAuthStore.getState().logout();
    });

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('clearError elimina el error', async () => {
    (apiClient.login as any).mockRejectedValue(new Error('Error'));
    await act(async () => {
      try {
        await useAuthStore.getState().login('x', 'x');
      } catch {
        // esperado
      }
    });

    act(() => {
      useAuthStore.getState().clearError();
    });

    expect(useAuthStore.getState().error).toBeNull();
  });
});
