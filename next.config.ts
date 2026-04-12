/**
 * next.config.ts
 * Configuración de Next.js 15
 *
 * Seguridad:
 * - Headers HTTP: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
 * - Redirect /debug → /admin/debug (eliminación de página legacy)
 * - CORE_API_URL solo como env var servidor (sin NEXT_PUBLIC_)
 *
 * Autor: GitHub Copilot (Claude Sonnet 4.6)
 */

import type { NextConfig } from 'next';

const CSP = [
  "default-src 'self'",
  // Next.js requiere unsafe-inline para scripts de hidratación
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Fuentes self-hosted (next/font descarga en build time)
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  // API interna (mismo origen via proxy BFF)
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Redirigir la página debug legacy (eliminada en S17) a la protegida /admin/debug
      {
        source: '/debug',
        destination: '/admin/debug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

