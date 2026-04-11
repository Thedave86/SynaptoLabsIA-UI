'use client';

import { LogOut, User, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Badge } from '@/components/ui';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const roleColors: Record<string, string> = {
    admin: 'danger',
    operator: 'warning',
    viewer: 'info',
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title || 'SynaptoLabsIA'}</h1>

      <div className="flex items-center gap-3">
        {/* Notificaciones (placeholder) */}
        <button
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Usuario */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <Badge
                variant={(roleColors[user.role] as any) || 'default'}
                className="text-[10px]"
              >
                {user.role}
              </Badge>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
