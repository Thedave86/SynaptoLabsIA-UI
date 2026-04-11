/**
 * app/layout.tsx
 * Root layout para Next.js 15 App Router
 * 
 * Autor: GitHub Copilot (Claude Sonnet 4.5)
 * Fecha: 2026-04-10
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SynaptoLabsIA Dashboard',
  description: 'Multi-agent orchestration platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
