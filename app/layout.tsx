/**
 * app/layout.tsx
 * Root layout para Next.js 15 App Router
 *
 * - Fuentes Inter y JetBrains Mono self-hosted via next/font/google
 *   (descarga en build time, sin requests externos a Google en runtime)
 * - noindex para aplicación interna
 *
 * Autor: GitHub Copilot (Claude Sonnet 4.6)
 */

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SynaptoLabsIA — Plataforma de Agentes IA',
  description: 'Interfaz de gestión para la plataforma multi-agente SynaptoLabsIA',
  // Aplicación interna — no indexar por crawlers
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-gray-50">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

