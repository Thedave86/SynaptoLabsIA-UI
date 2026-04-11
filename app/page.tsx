/**
 * app/page.tsx
 * Home page - redirige a /debug dashboard
 * 
 * Autor: GitHub Copilot (Claude Sonnet 4.5)
 * Fecha: 2026-04-10
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/debug');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500">Redirecting to dashboard...</p>
    </div>
  );
}
