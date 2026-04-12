/**
 * middleware.ts
 * Protección de rutas — Next.js Middleware.
 *
 * SEGURIDAD:
 * - Valida la firma y expiración del JWT (no solo su existencia)
 * - Protege rutas /admin con verificación de rol admin
 * - Cookie httpOnly gestionada por BFF (/api/auth/*)
 *
 * Autor: GitHub Copilot (Claude Sonnet 4.6)
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';

// Rutas públicas (no requieren autenticación)
const PUBLIC_PATHS = ['/login'];

// Rutas que requieren rol admin
const ADMIN_PATHS = ['/admin'];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET_KEY ?? 'changeme_in_production_use_secrets';
  return new TextEncoder().encode(secret);
}

interface SynaptoPayload extends JWTPayload {
  sub?: string;
  role?: string;
}

async function verifyToken(token: string): Promise<SynaptoPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });
    return payload as SynaptoPayload;
  } catch {
    // Token expirado, firma inválida, malformado — todos son inválidos
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas: permitir siempre
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('synaptolabs-token');

  // Sin cookie → redirigir a login
  if (!tokenCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validar firma + expiración del JWT
  const payload = await verifyToken(tokenCookie.value);

  if (!payload) {
    // Token inválido o expirado — limpiar cookie y redirigir
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('synaptolabs-token', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Rutas admin: verificar rol
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
     * - api routes (gestionadas por Next.js directamente)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};

