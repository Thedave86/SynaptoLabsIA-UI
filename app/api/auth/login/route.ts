/**
 * app/api/auth/login/route.ts
 * BFF: recibe credenciales desde el cliente, autentica contra el Core API
 * y establece una cookie httpOnly — el token nunca llega al JS del navegador.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { detail: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Llamada servidor→servidor al Core (sin CORS, sin exponer el token al browser)
    const coreResponse = await fetch(`${CORE_API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password, grant_type: 'password' }),
    });

    if (!coreResponse.ok) {
      const error = await coreResponse.json().catch(() => ({}));
      return NextResponse.json(
        { detail: error.detail || 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const { access_token, expires_in } = await coreResponse.json();

    // Obtener info del usuario para devolverla al cliente (sin el token)
    const meResponse = await fetch(`${CORE_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = meResponse.ok ? await meResponse.json() : null;

    // Cookie httpOnly — inaccesible desde JavaScript del navegador
    const cookieStore = await cookies();
    cookieStore.set('synaptolabs-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expires_in ?? 3600,
      path: '/',
    });

    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json(
      { detail: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
