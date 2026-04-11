/**
 * middleware.ts
 * Protección de rutas — Next.js Middleware.
 * Redirige a /login si no hay token en la cookie o localStorage no disponible.
 */

import { NextRequest, NextResponse } from 'next/server';

// Rutas públicas (no requieren autenticación)
const PUBLIC_PATHS = ['/login'];

// Rutas que requieren rol admin
const ADMIN_PATHS = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas: permitir siempre
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // El token se persiste en el store de Zustand (localStorage) en el cliente.
  // En el servidor/middleware no podemos leer localStorage.
  // Estrategia: usar Cookie 'synaptolabs-token' para la comprobación de middleware.
  // El cliente debe escribir esta cookie al hacer login (ver auth.store).
  const tokenCookie = request.cookies.get('synaptolabs-token');

  if (!tokenCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica middleware a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
