/**
 * hooks/useCurrentUser.ts
 * Hook que carga el usuario actual al montar si no está en el store.
 * Centraliza la lógica de carga de usuario eliminando efectos duplicados en pages.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { User } from '@/lib/types';

export function useCurrentUser(): User | null {
  const { user, loadUser } = useAuthStore();

  useEffect(() => {
    if (!user) {
      loadUser();
    }
    // Solo ejecutar en mount — loadUser es estable (Zustand no la redefine)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return user as User | null;
}
