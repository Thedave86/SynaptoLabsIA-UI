/**
 * app/api/auth/me/route.ts
 * BFF: lee la cookie httpOnly y retorna la información del usuario al cliente.
 * El token nunca llega al JavaScript del navegador.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:8000/api/v1';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('synaptolabs-token')?.value;

  if (!token) {
    return NextResponse.json({ detail: 'No autorizado' }, { status: 401 });
  }

  const coreResponse = await fetch(`${CORE_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!coreResponse.ok) {
    return NextResponse.json({ detail: 'Token inválido o expirado' }, { status: 401 });
  }

  const user = await coreResponse.json();
  return NextResponse.json(user);
}
